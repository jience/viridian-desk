use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use strum::{Display, EnumString};
use sys_locale::get_locale;
use tracing::{debug, error, info};

use crate::app::setup::VERSION;
use crate::utils::base::{app_root, create_file, exists};
use crate::utils::dirs;

const DEFAULT_GATEWAY_PORT: u16 = 11604;
pub const LOG_FILE_NAME: &str = "client.log";

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Gateway {
    pub name: String,
    pub address: String,
    #[serde(rename = "isPublic")]
    pub is_public: bool,
    pub uuid: String,
    pub auto: bool,
    pub port: u16,
}

#[derive(Debug, Display, EnumString, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "PascalCase")]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
    Off,
}

impl Default for LogLevel {
    fn default() -> Self {
        LogLevel::Info
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LogInfo {
    pub level: LogLevel,
    pub path: PathBuf,
    pub max_file_size: u64,
    pub rotation_strategy: u8,
    pub log_retention_files: usize,
}

impl LogInfo {
    pub fn get_size(&self) -> u64 {
        if let Ok(metadata) = std::fs::metadata(self.path.as_path()) {
            metadata.len()
        } else {
            0
        }
    }

    pub fn clean_log(&self) {
        info!("Cleaning all log files.");
        let log_path = &self.path;

        // --- Delete rotated log files --- //
        if let Some(log_dir) = log_path.parent() {
            if let Some(log_filename_os) = log_path.file_name() {
                let log_filename_base = log_filename_os.to_string_lossy();

                if let Ok(entries) = std::fs::read_dir(log_dir) {
                    for entry in entries.flatten() {
                        let entry_path = entry.path();
                        if entry_path.is_file() {
                            if let Some(filename) = entry_path.file_name().and_then(|n| n.to_str()) {
                                // Delete files that start with the log name but are not the exact log name
                                if filename.starts_with(&*log_filename_base) && filename != log_filename_base {
                                    debug!("Deleting rotated log file: {}", entry_path.display());
                                    if let Err(e) = std::fs::remove_file(&entry_path) {
                                        error!("Failed to delete rotated log file {}: {}", entry_path.display(), e);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // --- Truncate the main log file --- //
        info!("Truncating main log file: {}", log_path.display());
        if let Err(e) = std::fs::File::create(log_path) {
            error!("Failed to truncate main log file {}: {}", log_path.display(), e);
        }
    }
}

macro_rules! pub_struct {
  ($name:ident {$($field:ident: $t:ty,)*}) => {
    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct $name {
      $(pub $field: $t),*
    }
  }
}

pub_struct!(AppConf {
    // Linux and Windows: light / dark / system
    theme: Theme,
    auto_update: bool,
    auto_start: bool,
    full_screen: bool,
    developer_mode: bool,
    integration: bool,
    language: String,
    gateway: Vec<Gateway>,
    client_id: String,
    client_name: String,
    client_version: String,
    api_key: String,
    log: LogInfo,
});

#[derive(Debug, Display, EnumString, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum Theme {
    Light,
    Dark,
    System,
}

impl Default for Theme {
    fn default() -> Self {
        Theme::Light
    }
}

impl AppConf {
    pub fn new() -> Self {
        info!("app config new");
        let log_path = dirs::app_logs_dir()
            .unwrap_or_else(|e| {
                error!("Failed to get log dir, using fallback: {}", e);
                // Since app_root can fail, provide a default path
                app_root()
                    .unwrap_or_else(|_| PathBuf::from("."))
                    .join("logs")
            })
            .join(LOG_FILE_NAME);

        let default_gateway = Gateway {
            name: "VDIServer".into(),
            address: "VDIServer.com".into(),
            is_public: false,
            uuid: uuid::Uuid::new_v4().to_string(),
            auto: true,
            port: DEFAULT_GATEWAY_PORT, // Default port for non-public gateways
        };

        Self {
            theme: Theme::System,
            auto_update: false,
            auto_start: if cfg!(feature = "thin_client") { true } else { false },
            full_screen: false,
            developer_mode: false,
            integration: false,
            language: get_locale().unwrap_or_else(|| String::from("zh-CN")),
            gateway: vec![default_gateway],
            client_id: "".into(),
            client_name: "Client".into(),
            client_version: VERSION.get().unwrap_or(&"2.0.1".to_string()).clone(),
            api_key: "".into(),
            log: LogInfo {
                max_file_size: 10 * 1024 * 1024, // 10MB
                level: LogLevel::Info,
                path: log_path,
                rotation_strategy: 1,
                log_retention_files: 7,
            },
        }
    }

    pub fn file_path() -> anyhow::Result<PathBuf> {
        Ok(app_root()?.join(dirs::APP_CONFIG))
    }

    pub fn read() -> Self {
        match dirs::app_config_path() {
            Ok(path) => match std::fs::read_to_string(&path) {
                Ok(v) => {
                    if let Ok(v2) = serde_json::from_str::<AppConf>(&v) {
                        v2
                    } else {
                        error!("conf read parse error");
                        Self::default()
                    }
                }
                Err(err) => {
                    error!("conf read error: {}", err);
                    Self::default()
                }
            },
            Err(e) => {
                error!("Failed to get config path: {}", e);
                Self::default()
            }
        }
    }

    pub fn write(&self) -> anyhow::Result<()> {
        let path = Self::file_path()?;
        info!("App config file is: {}", path.display());
        if !exists(&path) {
            if let Err(e) = create_file(&path) {
                error!("Failed to create client config file: {}", e);
                return Err(e.into());
            }
            info!("create client config file");
        }
        let v = serde_json::to_string_pretty(self)?;
        std::fs::write(&path, v)?;
        Ok(())
    }

    pub fn load_or_init() -> Self {
        match Self::file_path() {
            Ok(config_path) => {
                if config_path.exists() {
                    info!("Reading existing app config from {}", config_path.display());
                    let mut conf = Self::read();
                    conf.client_version = VERSION.get().unwrap_or(&"2.0.1".to_string()).clone();
                    if let Err(e) = conf.write() {
                        error!("Failed to write updated config file: {}", e);
                    }
                    conf
                } else {
                    info!(
                        "Config file not found. Creating default config at {}",
                        config_path.display()
                    );
                    let conf = Self::default();
                    if let Err(e) = conf.write() {
                        error!("Failed to write initial config file: {}", e);
                    }
                    conf
                }
            }
            Err(e) => {
                error!(
                    "Failed to determine config path, using default config: {}",
                    e
                );
                Self::default()
            }
        }
    }

    pub fn get_auto_update(&self) -> bool {
        self.auto_update
    }

    pub fn get_current_gateway(&self) -> Option<Gateway> {
        self.gateway.iter().find(|x| x.auto).cloned()
    }

    pub fn get_request_base_url(&self) -> String {
        if let Some(gw) = self.get_current_gateway() {
            format!("https://{}:{}", gw.address, gw.port)
        } else {
            "".to_string()
        }
    }
}

impl Default for AppConf {
    fn default() -> Self {
        Self::new()
    }
}

pub mod cmd {
    use super::{AppConf, Gateway, Theme, DEFAULT_GATEWAY_PORT};
    use crate::app::state::AppState;
    use crate::utils::log_setup::set_log_level;
    use std::path::PathBuf;
    use tauri::{command, Manager, State};
    use tauri_plugin_opener::OpenerExt;
    use tracing::{debug, error, info};
    use uuid::Uuid;

    #[command]
    pub async fn get_app_conf(state: State<'_, AppState>) -> Result<AppConf, String> {
        Ok(state.app_conf.lock().await.clone())
    }

    #[command]
    pub async fn get_log_info(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
        let app_conf = state.app_conf.lock().await;
        let log_info = &app_conf.log;
        Ok(serde_json::json!({
            "level": &log_info.level.to_string(),
            "path": &log_info.path,
            "max_file_size": log_info.max_file_size,
            "rotation_strategy": log_info.rotation_strategy,
            "log_size": log_info.get_size(),
            "log_retention_files": &log_info.log_retention_files
        }))
    }

    #[command]
    pub async fn clean_log_file(state: State<'_, AppState>) -> Result<(), String> {
        info!("clean log file");
        state.app_conf.lock().await.log.clean_log();
        Ok(())
    }

    #[command]
    pub fn open_log_directory(app_handle: tauri::AppHandle) {
        info!("Opening log directory");
        tauri::async_runtime::spawn(async move {
            let state = app_handle.state::<AppState>();
            let log_path = state.app_conf.lock().await.log.path.clone();
            if let Some(parent_dir) = log_path.parent() {
                if let Some(path_str) = parent_dir.to_str() {
                    if let Err(e) = app_handle.opener().open_path(path_str, None::<&str>) {
                        error!("Failed to open log directory: {}", e);
                    }
                } else {
                    error!("Log directory path contains invalid UTF-8");
                }
            } else {
                error!("Could not get parent directory of log file");
            }
        });
    }

    #[command]
    pub async fn get_gateway_server(state: State<'_, AppState>) -> Result<Vec<Gateway>, String> {
        info!("get gateway server list from app config");
        let gateway = &state.app_conf.lock().await.gateway;
        // serde_json::to_string_pretty(gateway).map_err(|e| e.to_string())
        Ok(gateway.clone())
    }

    #[command]
    pub async fn add_gateway_server(
        name: String,
        address: String,
        is_public: bool,
        auto: bool,
        state: State<'_, AppState>,
    ) -> Result<(), String> {
        info!("add a gateway server into app config file");
        let (addr, port_val) = parse_address_and_port(address)?;

        let gw = Gateway {
            name,
            address: addr,
            is_public,
            uuid: Uuid::new_v4().to_string(),
            auto,
            port: port_val,
        };
        if let Ok(pretty_gw) = serde_json::to_string_pretty(&gw) {
            debug!("add gateway: {}", pretty_gw);
        }

        let mut conf = state.app_conf.lock().await;
        conf.gateway.push(gw);

        conf.write().map_err(|e| e.to_string())
    }

    #[command]
    pub async fn delete_gateway_server(
        gwid: String,
        state: State<'_, AppState>,
    ) -> Result<(), String> {
        debug!("delete gateway server: {}", &gwid);
        let mut conf = state.app_conf.lock().await;
        conf.gateway.retain(|x| *x.uuid != gwid);
        conf.write().map_err(|e| e.to_string())
    }

    #[command]
    pub async fn update_gateway_server(
        gwid: String,
        name: String,
        address: String,
        is_public: bool,
        state: State<'_, AppState>,
    ) -> Result<(), String> {
        debug!("update gateway server: {}", &gwid);
        let (addr, port_val) = parse_address_and_port(address)?;
        let mut conf = state.app_conf.lock().await;
        for gw in conf.gateway.iter_mut() {
            if gw.uuid == gwid {
                gw.name = name.clone();
                gw.address = addr.clone();
                gw.port = port_val;
                gw.is_public = is_public;
                break;
            }
        }
        conf.write().map_err(|e| e.to_string())
    }

    #[command]
    pub async fn switch_gateway_server(
        gwid: String,
        state: State<'_, AppState>,
    ) -> Result<(), String> {
        debug!("switch gateway server: {}", &gwid);
        let mut conf = state.app_conf.lock().await;
        for gw in conf.gateway.iter_mut() {
            gw.auto = gw.uuid == gwid;
        }
        conf.write().map_err(|e| e.to_string())
    }

    #[command]
    pub async fn set_theme(theme: Theme, state: State<'_, AppState>) -> Result<(), String> {
        debug!("set app theme: {}", theme);
        let mut conf = state.app_conf.lock().await;
        conf.theme = theme;
        conf.write().map_err(|e| e.to_string())
    }

    #[command]
    pub async fn set_language(language: String, state: State<'_, AppState>) -> Result<(), String> {
        debug!("set app language: {}", language);
        let mut conf = state.app_conf.lock().await;
        conf.language = language;
        conf.write().map_err(|e| e.to_string())
    }

    #[command]
    pub async fn set_autostart(auto_start: bool, state: State<'_, AppState>) -> Result<(), String> {
        debug!("set app auto start: {}", auto_start);
        let mut conf = state.app_conf.lock().await;
        conf.auto_start = auto_start;
        conf.write().map_err(|e| e.to_string())
    }

    #[command]
    pub async fn set_fullscreen(
        window: tauri::Window,
        full_screen: bool,
        state: State<'_, AppState>,
    ) -> Result<(), String> {
        debug!("set app fullscreen: {}", full_screen);
        if let Some(main_window) = window.get_webview_window("main") {
            if let Err(e) = main_window.set_fullscreen(full_screen) {
                error!("Failed to set fullscreen: {}", e);
            }
        } else {
            error!("Failed to get main window for setting fullscreen");
        }

        let mut conf = state.app_conf.lock().await;
        conf.full_screen = full_screen;
        conf.write().map_err(|e| e.to_string())
    }

    #[command]
    pub async fn set_autoupdate(
        auto_update: bool,
        state: State<'_, AppState>,
    ) -> Result<(), String> {
        debug!("set app auto update: {}", auto_update);
        let mut conf = state.app_conf.lock().await;
        conf.auto_update = auto_update;
        conf.write().map_err(|e| e.to_string())
    }

    #[command]
    pub async fn set_developer_mode(
        developer_mode: bool,
        state: State<'_, AppState>,
    ) -> Result<(), String> {
        use std::str::FromStr;
        use super::LogLevel;

        debug!("set app developer mode: {}", developer_mode);

        let new_level_str = if developer_mode { "Debug" } else { "Info" };

        // First, try to update the live log level
        if let Err(e) = set_log_level(new_level_str.to_string()).await {
            error!("Failed to set log level: {}", e);
            return Err(e);
        }

        // If successful, then update the configuration
        let mut conf = state.app_conf.lock().await;
        conf.developer_mode = developer_mode;

        // Also update the log level in the config
        let log_level_enum = LogLevel::from_str(new_level_str).map_err(|e| e.to_string())?;
        conf.log.level = log_level_enum;

        // Write the updated config to the file
        conf.write().map_err(|e| e.to_string())
    }

    #[command]
    pub async fn set_integration(
        integration: bool,
        state: State<'_, AppState>,
    ) -> Result<(), String> {
        debug!("set app integration: {}", integration);
        let mut conf = state.app_conf.lock().await;
        conf.integration = integration;
        conf.write().map_err(|e| e.to_string())
    }

    #[command]
    pub async fn set_log(
        state: State<'_, AppState>,
        path: Option<String>,
        max_file_size: Option<u64>,
        rotation_strategy: Option<u8>,
        log_retention_files: Option<usize>,
    ) -> Result<(), String> {
        debug!("set app log configuration");
        let mut conf = state.app_conf.lock().await;

        if let Some(p) = path {
            info!("Setting log path to: {}", p);
            conf.log.path = PathBuf::from(p);
        }

        if let Some(mfs) = max_file_size {
            info!("Setting log max file size to: {}", mfs);
            conf.log.max_file_size = mfs;
        }

        if let Some(rs) = rotation_strategy {
            info!("Setting log rotation strategy to: {}", rs);
            conf.log.rotation_strategy = rs;
        }

        if let Some(lrf) = log_retention_files {
            info!("Setting log retention files to: {}", lrf);
            conf.log.log_retention_files = lrf;
        }

        conf.write().map_err(|e| e.to_string())
    }

    /// Helper function to parse address and port
    fn parse_address_and_port(address: String) -> Result<(String, u16), String> {
        let (addr, port_val) = match address.rsplit_once(':') {
            Some((host, port_str)) => (
                host,
                port_str
                    .parse()
                    .map_err(|e| format!("Invalid port: {}", e))?,
            ),
            None => (address.as_str(), DEFAULT_GATEWAY_PORT),
        };
        Ok((addr.to_string(), port_val))
    }
}
