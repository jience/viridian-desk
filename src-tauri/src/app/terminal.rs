use crate::app::setup::VERSION;
use crate::config::AppConf;
use crate::core::sidecar::{
    get_terminal_model_from_sidecar, get_uuid_from_sidecar, ClientDeviceType, TerminalModel,
};
#[cfg(feature = "thin_client")]
use crate::services::shell::get_tc_sku_from_shell;
use crate::utils::base::{capitalize_first_letter, generate_device_uuid};
use local_ip_address::local_ip;
use mac_address::get_mac_address;
use serde::{Deserialize, Serialize};
use sysinfo::{CpuRefreshKind, System};
use tauri::{AppHandle, Wry};
use tracing::{debug, error, warn};

const CLIENT_NAME: &str = "Client";

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TerminalInfo {
    pub id: String,
    pub name: String,
    pub os_type: String,
    pub platform: String,
    pub platform_code: String,
    pub version_code: String,
    pub version_name: String,
    pub client_ip: String,
    pub cpu_info: String,
    pub mac: String,
    pub mem_info: u64,
    pub client_type: String,
    pub client_os_version: String,
    pub is_thin: bool,
    pub sku: String,
}

impl TerminalInfo {
    /// Constructs a new `TerminalInfo` asynchronously.
    pub async fn new_async(app_handle: &AppHandle<Wry>) -> Self {
        let terminal_model = get_terminal_model_from_sidecar(app_handle)
            .await
            .unwrap_or_else(|e| {
                warn!("Failed to get terminal model from sidecar: {}", e);
                // Provide a default or fallback TerminalModel
                TerminalModel {
                    client_device_type: ClientDeviceType::Sc,
                    client_type: "U".to_string(),
                    client_os: "Unknown".to_string(),
                    client_os_version: "".to_string(),
                }
            });

        Self::default()
            .with_unique_id(app_handle)
            .await
            .with_os_info(terminal_model)
            .with_version_info()
            .with_hardware_and_network_info()
            .with_sku()
            .await
    }

    /// Sets the unique device ID.
    async fn with_unique_id(mut self, app_handle: &AppHandle<Wry>) -> Self {
        self.id = get_uuid_from_sidecar(app_handle).await.unwrap_or_else(|e| {
            warn!("Failed to get UUID from sidecar: {}, using fallback", e);
            generate_device_uuid()
        });

        let mut conf = AppConf::read();
        if conf.client_id != self.id {
            conf.client_id = self.id.clone();
            if let Err(e) = conf.write() {
                error!("Failed to write client_id to config: {}", e);
            }
        }
        self
    }

    /// Gathers operating system information from the sidecar model.
    fn with_os_info(mut self, model: TerminalModel) -> Self {
        self.os_type = capitalize_first_letter(&model.client_os.clone());
        self.client_os_version = model.client_os_version;
        self.is_thin = model.client_device_type == ClientDeviceType::Tc;
        self.client_type = match model.client_type.to_lowercase().as_str() {
            "linux" => "L".to_string(),
            "windows" => "W".to_string(),
            "generic" => "Generic".to_string(),
            "P-generic" => "P".to_string(),
            "M-generic" => "M".to_string(),
            _ => model.client_type.replace('-', ""),
        };
        self.platform = std::env::consts::OS.parse().unwrap();
        self.platform_code = format!("{}-{}", CLIENT_NAME, self.client_type);
        self.name = format!("{}_{}", self.platform_code, &self.id[..8]);
        self
    }

    /// Reads version information from the application configuration.
    fn with_version_info(mut self) -> Self {
        let version = VERSION.get().unwrap_or(&"2.0.1".to_string()).clone();
        self.version_code = version.clone();
        self.version_name = version;
        self
    }

    /// Gathers hardware (CPU, memory, MAC Address) and network (IP) information.
    fn with_hardware_and_network_info(mut self) -> Self {
        // Get MAC address
        self.mac = match get_mac_address() {
            Ok(Some(ma)) => {
                debug!("MAC addr = {}", ma.to_string());
                ma.to_string()
            }
            Ok(None) => {
                debug!("No MAC address found.");
                "".to_string()
            }
            Err(e) => {
                error!("Failed to get MAC address: {:?}", e);
                "".to_string()
            }
        };

        // Get local IP address
        self.client_ip = local_ip().map_or("".to_string(), |ip| ip.to_string());

        // Get CPU and Memory information
        let mut system = System::new();
        system.refresh_cpu_specifics(CpuRefreshKind::everything());
        system.refresh_memory();
        self.cpu_info = system
            .cpus()
            .first()
            .map_or("".to_string(), |cpu| cpu.brand().to_string());
        self.mem_info = system.total_memory();

        self
    }

    /// Sets the SKU for thin clients.
    async fn with_sku(mut self) -> Self {
        if self.is_thin {
            #[cfg(feature = "thin_client")]
            {
                self.sku = get_tc_sku_from_shell().await.unwrap_or_else(|e| {
                    warn!("Failed to get SKU from shell: {}", e);
                    "".to_string()
                });
            }
        } else {
            self.sku = "".to_string()
        }
        self
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ClientAbout {
    pub client_id: String,
    pub client_name: String,
    pub client_version: String,
    pub client_type: String,
    pub sku: String,
    pub license: String,
    pub copyright: String,
    pub build_id: String,
}

pub mod cmd {
    use super::{ClientAbout, TerminalInfo, CLIENT_NAME};
    use crate::app::state::{AppState, GatewayConf};
    use crate::services::api::{check_upgrade, UpgradeRes};
    use tracing::error;
    use serde_json::json;
    use std::sync::Arc;
    use tauri::State;

    #[tauri::command]
    pub async fn get_terminal_info(app_state: State<'_, AppState>) -> Result<TerminalInfo, ()> {
        let terminal_info = app_state.terminal_info.lock().await;
        Ok(terminal_info.clone())
    }

    #[tauri::command]
    pub async fn check_version_upgrade(
        app_state: State<'_, AppState>,
    ) -> Result<UpgradeRes, String> {
        let terminal = app_state.terminal_info.lock().await.clone();
        match check_upgrade(&json!({
          "id": terminal.id.as_str(),
          "enableProxy": false,
          "fileType": CLIENT_NAME.to_lowercase(),
          "isManual": true,
          "originIp": terminal.client_ip.as_str(),
        }))
        .await
        {
            Ok(res) => Ok(res),
            Err(e) => {
                let err_msg = format!("Check upgrade error: {:?}", e);
                error!("{}", err_msg);
                Err(err_msg)
            }
        }
    }

    #[tauri::command]
    pub async fn get_client_about(app_state: State<'_, AppState>) -> Result<ClientAbout, ()> {
        let gateway_conf_cloned = Arc::clone(&app_state.gateway_conf);
        let gateway_conf = gateway_conf_cloned.lock().await;
        let terminal_info = app_state.terminal_info.lock().await;

        Ok(ClientAbout {
            client_id: terminal_info.id.clone(),
            client_name: terminal_info.name.clone(),
            client_version: terminal_info.version_name.clone(),
            client_type: terminal_info.client_type.clone(),
            sku: terminal_info.sku.clone(),
            license: gateway_conf.license.clone(),
            copyright: gateway_conf.copyright.clone(),
            build_id: env!("GIT_HASH").to_string(),
        })
    }

    #[tauri::command]
    pub async fn get_client_config(app_state: State<'_, AppState>) -> Result<GatewayConf, ()> {
        let gateway_conf_cloned = Arc::clone(&app_state.gateway_conf);
        let gateway_conf = gateway_conf_cloned.lock().await;
        let gateway_clone = gateway_conf.clone();
        Ok(gateway_clone)
    }
}
