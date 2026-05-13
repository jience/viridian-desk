use crate::app::terminal::TerminalInfo;
use crate::config::client::AppConf;
use crate::services::idle_user::UserPolicy;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use strum::{Display, EnumString};
use tauri::async_runtime::Mutex;
use tauri::{AppHandle, Wry};
use tokio::sync::Notify;
use tokio_util::sync::CancellationToken;

#[derive(Debug, Display, EnumString)]
pub enum ClientStatus {
    Offline,
    Online,
    Disconnection,
    Connection,
}
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Display, EnumString, Default)]
#[serde(rename_all = "PascalCase")]
pub enum LoginType {
    #[default]
    Local,
    Domain,
    Corp,
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct UserInfo {
    pub user_id: String,
    pub login_name: String,
    pub user_name: String,
    pub email: Option<String>,
    pub telephone: Option<String>,
    #[serde(rename = "type")]
    pub login_type: LoginType,
    pub password: String,
    pub user_policy: Option<UserPolicy>,
}

#[derive(Debug, Deserialize, Serialize, Default)]
pub struct AuthState {
    #[serde(skip_serializing)]
    pub token: Option<String>,
    pub logged_in: bool,
    pub user: Option<UserInfo>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct HeartbeatPayloadState {
    pub status: String,
    #[serde(rename = "userId")]
    pub user_id: String,
    pub desktops: Vec<String>,
    #[serde(rename = "remoteApps")]
    pub remote_apps: Vec<String>,
}

impl Default for HeartbeatPayloadState {
    fn default() -> Self {
        Self {
            status: ClientStatus::Offline.to_string(),
            user_id: "".into(),
            desktops: [].to_vec(),
            remote_apps: [].to_vec(),
        }
    }
}

#[derive(Debug)]
pub struct ClientOnlineState {
    pub is_online: bool,
    pub immediate_reconnect: bool,
    pub reconnect_notifier: Arc<Notify>,
}

impl Default for ClientOnlineState {
    fn default() -> Self {
        Self {
            is_online: false,
            immediate_reconnect: false,
            reconnect_notifier: Arc::new(Notify::new()),
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GatewayConf {
    pub logo: String,
    pub logo_white: String,
    pub license: String,
    pub client_icon_png: String,
    pub client_icon_ico: String,
    pub company_name: String,
    pub is_update: String,
    pub copyright: String,
    pub client_prefix: String,
    pub timeout: String,
    pub client_theme: String,
    pub desk_toolbar: String,
    pub desk_toolbar_position: String,
    pub login_types: String,
    pub company_phone: String,
    pub company_email: String,
    pub gateway_addr_show_switch: String,
    pub display_version: String,
    pub background_image: String,
    pub terminal_remember_password_switch: String,
    pub publicity_image: String,
    pub float_ball: String,
    pub first_login_reset_password_switch: String,
    pub one_time_password_switch: String,
    pub security_password: String,
    pub security_password_switch: String,
    pub sms_reset_password_switch: String,
    pub terminal_graph_authentication_switch: String,
    pub terminal_login_error_times: String,
    pub terminal_login_metering_minute: String,
    pub terminal_multi_factor_authentication_switch: String,
    pub terminal_password_remaining_validity: String,
    pub terminal_password_valid_days: String,
    pub terminal_strong_password_switch: String,
    pub warn_login_from_different_location_switch: String,
}

impl Default for GatewayConf {
    fn default() -> Self {
        Self {
            logo: "".into(),
            logo_white: "".into(),
            license: "".into(),
            client_icon_png: "".into(),
            client_icon_ico: "".into(),
            company_name: "".into(),
            is_update: "".into(),
            copyright: "".into(),
            client_prefix: "".into(),
            timeout: "0".into(),
            client_theme: "default".into(),
            desk_toolbar: "ON".into(),
            desk_toolbar_position: "center".into(),
            login_types: "local".into(),
            company_phone: "".into(),
            company_email: "".into(),
            gateway_addr_show_switch: "Disabled".into(),
            display_version: "".into(),
            background_image: "".into(),
            terminal_remember_password_switch: "Disabled".into(),
            publicity_image: "".into(),
            float_ball: "Disabled".into(),
            first_login_reset_password_switch: "Disabled".into(),
            one_time_password_switch: "Disabled".into(),
            security_password: "".into(),
            security_password_switch: "Disabled".into(),
            sms_reset_password_switch: "Disabled".into(),
            terminal_graph_authentication_switch: "Disabled".into(),
            terminal_login_error_times: "5".into(),
            terminal_login_metering_minute: "20".into(),
            terminal_multi_factor_authentication_switch: "Disabled".into(),
            terminal_password_remaining_validity: "0".into(),
            terminal_password_valid_days: "0".into(),
            terminal_strong_password_switch: "Disabled".into(),
            warn_login_from_different_location_switch: "Disabled".into(),
        }
    }
}

/// 所有的应用级状态都由一个 AppState 来管理
#[derive(Clone)]
pub struct AppState {
    pub auth: Arc<Mutex<AuthState>>,
    pub online_state: Arc<Mutex<ClientOnlineState>>,
    pub heartbeat_payload_state: Arc<Mutex<HeartbeatPayloadState>>,
    pub gateway_conf: Arc<Mutex<GatewayConf>>,
    pub terminal_info: Arc<Mutex<TerminalInfo>>,
    pub app_conf: Arc<Mutex<AppConf>>,
    pub idle_service_token: Arc<Mutex<Option<CancellationToken>>>,
}

impl AppState {
    pub async fn new(app_handle: &AppHandle<Wry>) -> Self {
        Self {
            app_conf: Arc::new(Mutex::new(AppConf::load_or_init())),
            auth: Arc::new(Mutex::new(AuthState::default())),
            online_state: Arc::new(Mutex::new(ClientOnlineState::default())),
            heartbeat_payload_state: Arc::new(Mutex::new(HeartbeatPayloadState::default())),
            gateway_conf: Arc::new(Mutex::new(GatewayConf::default())),
            terminal_info: Arc::new(Mutex::new(TerminalInfo::new_async(app_handle).await)),
            idle_service_token: Arc::new(Mutex::new(None)),
        }
    }
}
