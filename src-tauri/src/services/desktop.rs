use super::shell::{log_hdp_viewer_output, run_hdp_command, HDP_VIEWER_COMMAND};
use crate::app::state::{AppState, ClientStatus, LoginType};
use crate::events::desktop::send_connect_event;
use crate::services::api::{enter_desktop, exit_desktop, get_desktop, get_desktop_spice_add};
use crate::services::policy::prepare_spice_args;
use crate::services::types::{ConnectError, DesktopInfo, DesktopSpiceInfo, DesktopStatus};
use tracing::{debug, error, info, warn};
use serde_json::json;
use std::sync::Arc;
use tauri::path::BaseDirectory;
use tauri::{Manager, State};

// --- Private Helper Functions for clear logic separation ---

/// Fetches desktop details and validates its status.
async fn get_validated_desktop_info(
    app_state: &State<'_, AppState>,
    desktop_id: &str,
) -> Result<DesktopInfo, ConnectError> {
    // Clone the necessary info within a tightly scoped lock to avoid holding the lock across an await point.
    let login_name_if_domain: Option<String> = {
        let auth_state = app_state.auth.lock().await;
        if let Some(user_info) = &auth_state.user {
            if user_info.login_type == LoginType::Domain {
                Some(user_info.login_name.clone()) // Clone the data we need
            } else {
                None
            }
        } else {
            None
        }
    }; // Lock is released here

    // Build params dynamically using a Map
    let mut params_map = serde_json::Map::new();
    params_map.insert("id".to_string(), json!(desktop_id));
    params_map.insert("isActive".to_string(), json!(true));
    params_map.insert("isReturnPolicyConnectionValue".to_string(), json!(true));

    if let Some(login_name) = login_name_if_domain {
        params_map.insert("loginName".to_string(), json!(login_name));
    }

    let params = serde_json::Value::Object(params_map);

    let desktop_info_data = get_desktop(&params).await?;
    let desktop_info: DesktopInfo = serde_json::from_value(desktop_info_data.data)?;
    debug!("Desktop details received: {:?}", desktop_info);

    if desktop_info.status != DesktopStatus::Start {
        return Err(ConnectError::InvalidDesktopStatus(
            desktop_info.status.to_string(),
        ));
    }
    Ok(desktop_info)
}

/// Fetches the SPICE connection details for a given desktop.
async fn get_spice_info(desktop_id: &str) -> Result<DesktopSpiceInfo, ConnectError> {
    let spice_info_data = get_desktop_spice_add(&json!({ "id": desktop_id })).await?;
    Ok(serde_json::from_value(spice_info_data.data)?)
}

/// Spawns the viewer in a background task and manages state for its entire lifecycle.
fn spawn_viewer_and_manage_state(
    app_state: State<'_, AppState>,
    desktop_id: String,
    spice_args: Vec<String>,
) {
    let heartbeat_payload_cloned = Arc::clone(&app_state.heartbeat_payload_state);

    tokio::spawn(async move {
        info!("Spawning hdp-viewer for desktop: {}", &desktop_id);

        match run_hdp_command(HDP_VIEWER_COMMAND, spice_args).await {
            Ok(child) => {
                if let Err(e) = log_hdp_viewer_output(child).await {
                    error!("Error logging hdp-viewer output: {}", e);
                }
            }
            Err(e) => {
                error!(
                    "hdp-viewer for desktop {} failed to spawn: {:?}",
                    &desktop_id, e
                );
            }
        }

        info!("Desktop session ended for: {}", &desktop_id);

        // This block runs after the viewer process has terminated.
        let mut payload = heartbeat_payload_cloned.lock().await;
        payload.desktops.retain(|id| id != &desktop_id);
        if payload.desktops.is_empty() {
            payload.status = ClientStatus::Disconnection.to_string();
            info!("All desktops disconnected. Client status set to Disconnection.");
        }

        if let Err(e) = exit_desktop(&desktop_id).await {
            error!(
                "API call to exit_desktop failed for {}: {:?}",
                &desktop_id, e
            );
        }
    });
}

/// The core logic for connecting to a desktop.
async fn connect_desktop_internal(
    app_state: State<'_, AppState>,
    desktop_id: String,
    desktop_ip: String,
    mac_address: String,
    ca_path: Option<String>,
) -> Result<(), ConnectError> {
    info!("Starting connection process for desktop: {}", &desktop_id);

    // 1. Get and validate desktop info
    let desktop_info = get_validated_desktop_info(&app_state, &desktop_id).await?;
    info!("Desktop status is 'Start', proceeding with connection.");

    // 2. Get SPICE connection details
    let spice_info = get_spice_info(&desktop_id).await?;
    debug!("Successfully fetched SPICE details.");

    // Get user info from state
    let user_info = app_state.auth.lock().await.user.clone();

    // 3. Prepare SPICE arguments
    let spice_args = prepare_spice_args(
        &desktop_info,
        spice_info,
        ca_path,
        user_info,
        desktop_ip,
        mac_address,
    )?;

    // 4. Notify the server that we are entering the desktop
    enter_desktop(&desktop_id).await?;
    debug!("Successfully notified server of desktop entry.");

    // 5. Update application state before spawning viewer
    {
        let heartbeat_payload_cloned = Arc::clone(&app_state.heartbeat_payload_state);
        let mut payload = heartbeat_payload_cloned.lock().await;
        payload.status = ClientStatus::Connection.to_string();
        payload.desktops.push(desktop_id.clone());
    }

    // 6. Spawn the viewer in a separate async task
    spawn_viewer_and_manage_state(app_state, desktop_id, spice_args);

    Ok(())
}

/// --- Public Tauri Command ---
#[tauri::command]
#[tracing::instrument(skip(app, app_state, desktop_ip, mac_address), fields(desktop_id = %desktop_id))]
pub async fn connect_desktop(
    app: tauri::AppHandle,
    desktop_id: String,
    desktop_ip: String,
    mac_address: String,
    app_state: State<'_, AppState>,
) -> Result<(), String> {
    let ca_path: Option<String> = app
        .path()
        .resolve("resources/ca-cert.pem", BaseDirectory::Resource)
        .ok()
        .map(|p| p.to_string_lossy().to_string());

    if ca_path.is_none() {
        warn!("Could not resolve path to ca-cert.pem resource.");
    }

    let result = connect_desktop_internal(
        app_state,
        desktop_id.clone(),
        desktop_ip,
        mac_address,
        ca_path,
    )
    .await;

    // Notify the frontend of the connection attempt outcome.
    let is_connected = result.is_ok();
    send_connect_event(app, desktop_id.clone(), is_connected).await;

    // Return Ok or an error string to the frontend.
    result.map_err(|e| {
        error!(
            "Failed to complete connection process for desktop {}: {}",
            &desktop_id, e
        );
        e.to_string()
    })
}
