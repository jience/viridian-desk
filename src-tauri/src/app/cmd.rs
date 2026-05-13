use crate::app::state::{AppState, ClientStatus, UserInfo};
use crate::core::sidecar::{self, NetProbe};
use crate::services::{idle_user, shell};
use crate::utils::network;
use tracing::{debug, error, info};
use serde::Serialize;
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use std::process::Command;
use std::sync::Arc;
use tauri::{ipc::Channel, Manager, State, Window};

const DOCS_WINDOW_LABEL: &str = "docs";
const MAIN_WINDOW_LABEL: &str = "main";
const SPLASHSCREEN_WINDOW_LABEL: &str = "splashscreen";

#[derive(Clone, Serialize)]
pub struct PortStatus {
    port: u16,
    is_open: bool,
}


#[derive(Clone, Serialize)]
#[serde(tag = "event", content = "data")]
pub enum DiagnoseEvent {
    #[serde(rename_all = "camelCase")]
    Started {
        total_items: usize,
    },
    #[serde(rename_all = "camelCase")]
    Progress {
        diagnosed_items: usize,
        status: PortStatus,
    },
    Finished,
}

#[tauri::command]
pub async fn diagnose_gateway_network(
    app_state: State<'_, AppState>,
    on_event: Channel<DiagnoseEvent>,
) -> Result<(), String> {
    let app_conf = app_state.app_conf.lock().await;
    let gateway = app_conf
        .get_current_gateway()
        .ok_or_else(|| "No active gateway found".to_string())?;

    let mut ports_to_check = vec![11609];
    if !ports_to_check.contains(&gateway.port) {
        ports_to_check.push(gateway.port);
    }

    if gateway.is_public {
        // todo: add Proxy.socket_port and Proxy.download_port
        ports_to_check.push(11234);
    } else {
        ports_to_check.push(gateway.port + 39);
    }

    let mut started = false;
    let total_items = ports_to_check.len();
    let mut diagnosed_items = 0;

    for port in ports_to_check {
        if !started {
            let _ = on_event.send(DiagnoseEvent::Started { total_items });
            started = true;
            info!("======== Starting diagnosis ========");
        }
        let is_open = network::diagnose_port(&gateway.address, port).await;
        diagnosed_items += 1;
        let status = PortStatus { port, is_open };
        let _ = on_event.send(DiagnoseEvent::Progress { diagnosed_items, status});
        debug!(
            "======== Diagnosis progress ({diagnosed_items}/{total_items}) ========"
        );
    }

    let _ = on_event.send(DiagnoseEvent::Finished);
    info!("======== Diagnosis finished ========");

    Ok(())
}

#[tauri::command]
pub async fn open_docs(
    handle: tauri::AppHandle,
    app_state: State<'_, AppState>,
) -> Result<(), String> {
    let docs_url = {
        let conf = app_state.app_conf.lock().await;
        if let Some(gateway) = conf.get_current_gateway() {
            format!("https://{}:{}/terminalDocs", gateway.address, gateway.port)
        } else {
            let err_msg = "No active gateway found".to_string();
            error!("{}", err_msg);
            return Err(err_msg);
        }
    };
    debug!("Docs URL: {}", docs_url);

    if let Some(window) = handle.get_webview_window(DOCS_WINDOW_LABEL) {
        window.set_focus().map_err(|e| e.to_string())?;
    } else {
        let url = docs_url
            .parse()
            .map_err(|e| format!("Invalid URL: {}", e))?;
        tauri::WebviewWindowBuilder::new(
            &handle,
            DOCS_WINDOW_LABEL,
            tauri::WebviewUrl::External(url),
        )
        .title("帮助文档")
        .build()
        .map_err(|e| format!("Failed to build window: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn close_splashscreen(window: tauri::Window) -> Result<(), String> {
    if let Some(splashscreen) = window.get_webview_window(SPLASHSCREEN_WINDOW_LABEL) {
        splashscreen
            .close()
            .map_err(|e| format!("Failed to close splashscreen: {}", e))?;
    }

    let main_window = window
        .get_webview_window(MAIN_WINDOW_LABEL)
        .ok_or_else(|| "Main window not found".to_string())?;

    main_window
        .show()
        .map_err(|e| format!("Failed to show main window: {}", e))?;

    Ok(())
}

#[tauri::command]
#[tracing::instrument(skip(window, app_state, auth_token), fields(user_id = %user_info.user_id))]
pub async fn login(
    window: Window,
    app_state: State<'_, AppState>,
    user_info: UserInfo,
    auth_token: String,
) -> Result<(), String> {
    info!("User login [Username: {:?}][Type: {:?}]", user_info.login_name, user_info.login_type);
    let app_handle = window.app_handle().clone();
    let heartbeat_payload_state = Arc::clone(&app_state.heartbeat_payload_state);
    let mut auth_state = app_state.auth.lock().await;
    auth_state.logged_in = true;
    auth_state.token = Some(auth_token);
    let user_id = user_info.user_id.clone();

    // Start idle service if there's a policy for it
    if let Some(session_policy) = user_info
        .user_policy
        .as_ref()
        .and_then(|p| p.session.as_ref())
    {
        let mut token_guard = app_state.idle_service_token.lock().await;
        // If a service is already running, cancel it before starting a new one.
        if let Some(existing_token) = token_guard.take() {
            info!("Cancelling existing idle user service.");
            existing_token.cancel();
        }
        let new_token = idle_user::start(app_handle, session_policy);
        *token_guard = Some(new_token);
    }

    auth_state.user = Some(user_info);

    debug!("AuthState is : {:?}", auth_state);

    let mut payload_state = heartbeat_payload_state.lock().await;
    payload_state.user_id = user_id;
    payload_state.status = ClientStatus::Disconnection.to_string();

    debug!("HeartbeatPayloadState is : {:?}", payload_state);
    Ok(())
}

#[tauri::command]
#[tracing::instrument(skip(app_state))]
pub async fn logout(app_state: State<'_, AppState>) -> Result<(), String> {
    info!("User logout");

    // Kill all running hdp-viewer processes before logging out
    shell::kill_all_hdp_viewers().await?;
    shell::kill_all_hdp_vapp().await?;

    // Stop the idle service if it's running
    let mut token_guard = app_state.idle_service_token.lock().await;
    if let Some(token) = token_guard.take() {
        info!("Stopping idle user service.");
        token.cancel();
    }

    let heartbeat_payload_state = Arc::clone(&app_state.heartbeat_payload_state);
    let mut auth_state = app_state.auth.lock().await;
    auth_state.logged_in = false;
    auth_state.token = None;
    auth_state.user = None;

    debug!("AuthState is : {:?}", auth_state);

    let mut payload_state = heartbeat_payload_state.lock().await;
    payload_state.user_id = "".to_string();
    payload_state.status = ClientStatus::Online.to_string();

    debug!("HeartbeatPayloadState is : {:?}", payload_state);
    Ok(())
}

#[tauri::command]
pub async fn get_client_online_status(app_state: State<'_, AppState>) -> Result<bool, String> {
    let online_state_cloned = Arc::clone(&app_state.online_state);
    let state = online_state_cloned.lock().await;

    let is_online = state.is_online;

    debug!("client online status is: {}", &is_online);

    Ok(is_online)
}

#[tauri::command]
pub async fn get_local_net_info(app_handle: tauri::AppHandle) -> Result<Vec<NetProbe>, String> {
    sidecar::get_net_probe_from_sidecar(&app_handle)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn shutdown_local_device() -> Result<(), String> {
    info!("Shutting down local device");

    #[cfg(target_os = "windows")]
    let mut command = {
        use crate::utils::constant::CREATE_NO_WINDOW;
        let mut cmd = Command::new("shutdown");
        cmd.args(["/s", "/t", "0"]).creation_flags(CREATE_NO_WINDOW);
        cmd
    };

    #[cfg(target_os = "linux")]
    let mut command = Command::new("/sbin/poweroff");

    #[cfg(target_os = "macos")]
    let mut command = {
        let mut cmd = Command::new("shutdown");
        cmd.arg("-h").arg("now");
        cmd
    };

    let status = command
        .status()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if status.success() {
        Ok(())
    } else {
        let error_message = if let Some(code) = status.code() {
            format!("exited with status code {}", code)
        } else {
            "was terminated by a signal".to_string()
        };
        Err(format!("Failed to shut down: {}", error_message))
    }
}

#[tauri::command]
pub async fn open_network_settings() -> Result<(), String> {
    info!("Opening network settings");

    #[cfg(target_os = "windows")]
    let mut command = {
        use crate::utils::constant::CREATE_NO_WINDOW;
        let mut cmd = Command::new("control.exe");
        cmd.arg("ncpa.cpl").creation_flags(CREATE_NO_WINDOW);
        cmd
    };

    #[cfg(target_os = "linux")]
    let mut command = Command::new("nm-connection-editor");

    #[cfg(target_os = "macos")]
    let mut command = {
        let mut cmd = Command::new("open");
        cmd.arg("/System/Library/PreferencePanes/Network.prefPane");
        cmd
    };

    let status = command
        .status()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if status.success() {
        Ok(())
    } else {
        let error_message = if let Some(code) = status.code() {
            format!("exited with status code {}", code)
        } else {
            "was terminated by a signal".to_string()
        };
        Err(format!(
            "Failed to open network settings: command {}",
            error_message
        ))
    }
}
