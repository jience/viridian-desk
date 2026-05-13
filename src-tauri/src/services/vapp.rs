use std::sync::Arc;
use serde_json::json;
use tauri::State;
use tracing::{debug, error, info};
use crate::app::state::{AppState, ClientStatus};
use crate::services::api::{enter_vapp, exit_vapp, get_vapp};
use crate::services::types::{ConnectError, VappInfo, DesktopStatus};
use crate::services::shell::{log_hdp_viewer_output, run_hdp_command, HDP_VAPP_COMMAND};
use crate::utils::tools::rsa_decrypt;

async fn get_validated_vapp_info(
    vapp_id: &str,
    m_id: &u8
) -> Result<VappInfo, ConnectError> {

    // Build params dynamically using a Map
    let mut params_map = serde_json::Map::new();
    params_map.insert("mId".to_string(), json!(m_id));
    params_map.insert("vappId".to_string(), json!(vapp_id));
    params_map.insert("isActive".to_string(), json!(true));

    let params = serde_json::Value::Object(params_map);
    let vapp_info_data = get_vapp(&params).await?;
    let vapp_info: VappInfo = serde_json::from_value(vapp_info_data.data)?;
    debug!("Virtual application details received: {:?}", vapp_info);

    if vapp_info.desktop.status != DesktopStatus::Start {
        return Err(ConnectError::InvalidDesktopStatus(
            vapp_info.desktop.status.to_string(),
        ));
    }
    Ok(vapp_info)
}

/// The core logic for connecting to a virtual application.
async fn connect_vapp_internal(
    app_state: State<'_, AppState>,
    vapp_id: String,
    m_id: u8
) -> Result<(), ConnectError> {
    info!("Starting connection process for virtual application: {}", &vapp_id);

    // 1. Get and validate virtual application info
    let vapp_info = get_validated_vapp_info(&vapp_id, &m_id).await?;
    let desktop_id = vapp_info.desktop.id.clone();

    // 3. Prepare hdp-vapp arguments
    let hdp_vapp_args = prepare_hdp_vapp_args(&vapp_info)?;
    debug!("Virtual application connection args (pre-encryption): {:?}", hdp_vapp_args);

    // 4. Notify the server that we are entering the desktop
    enter_vapp(&vapp_id, &desktop_id).await?;
    debug!("Successfully notified server of virtual application entry.");

    // 5. Update application state before spawning viewer
    {
        let heartbeat_payload_cloned = Arc::clone(&app_state.heartbeat_payload_state);
        let mut payload = heartbeat_payload_cloned.lock().await;
        payload.status = ClientStatus::Connection.to_string();
        payload.remote_apps.push(vapp_id.clone());
    }

    // 6. Spawn the hdp-vapp in a separate async task
    spawn_hdp_vapp_and_manage_state(app_state, vapp_id, desktop_id, hdp_vapp_args);

    Ok(())
}

/// Prepares the command-line arguments for the hdp-viewer.
pub fn prepare_hdp_vapp_args(
    vapp_info: &VappInfo,
) -> Result<Vec<String>, ConnectError> {

    // 1. Decrypt the password (a distinct, failable step)
    let spice_pwd_decrypted = rsa_decrypt(vapp_info.desktop.spice_password.clone())
        .map_err(|e| ConnectError::DecryptionError(e.to_string()))?;

    // 2. Use the builder to construct the platform-agnostic argument list
    let base_args = HdpVappArgsBuilder::new(
        &vapp_info,
        &spice_pwd_decrypted,
    ).build()?;

    Ok(base_args)
}

/// Spawns the hdp-vapp in a background task and manages state for its entire lifecycle.
fn spawn_hdp_vapp_and_manage_state(
    app_state: State<'_, AppState>,
    vapp_id: String,
    desktop_id: String,
    spice_args: Vec<String>,
) {
    let heartbeat_payload_cloned = Arc::clone(&app_state.heartbeat_payload_state);

    tokio::spawn(async move {
        info!("Spawning hdp-vapp for virtual application: {}", &vapp_id);

        match run_hdp_command(HDP_VAPP_COMMAND, spice_args).await {
            Ok(child) => {
                if let Err(e) = log_hdp_viewer_output(child).await {
                    error!("Error logging hdp-vapp output: {}", e);
                }
            }
            Err(e) => {
                error!(
                    "hdp-vapp for virtual application {} failed to spawn: {:?}",
                    &vapp_id, e
                );
            }
        }

        info!("Virtual application session ended for: {}", &vapp_id);

        // This block runs after the hdp-vapp process has terminated.
        let mut payload = heartbeat_payload_cloned.lock().await;
        payload.remote_apps.retain(|id| id != &vapp_id);
        if payload.remote_apps.is_empty() {
            // payload.status = ClientStatus::Disconnection.to_string();
            info!("All virtual application disconnected.");
        }

        if let Err(e) = exit_vapp(&vapp_id, &desktop_id).await {
            error!(
                "API call to exit_vapp failed for {}: {:?}",
                &vapp_id, e
            );
        }
    });
}


#[tauri::command]
#[tracing::instrument(skip(app_state), fields(vapp_id = %vapp_id))]
pub async fn connect_vapp(
    app_state: State<'_, AppState>,
    vapp_id: String,
    m_id: u8
) -> Result<(), String> {
    let result = connect_vapp_internal(
        app_state, vapp_id.clone(), m_id.clone()).await;

    // Return Ok or an error string to the frontend.
    result.map_err(|e| {
        error!(
            "Failed to complete connection process for desktop {}: {}",
            &vapp_id, e
        );
        e.to_string()
    })
}


/// --- Builder for HDP-VAPP arguments ---
struct HdpVappArgsBuilder<'a> {
    vapp_info: &'a VappInfo,
    spice_pwd_decrypted: &'a str,
    args: Vec<String>,
}

impl<'a> HdpVappArgsBuilder<'a> {
    fn new(
        vapp_info: &'a VappInfo,
        spice_pwd_decrypted: &'a str,
    ) -> Self {
        Self { vapp_info, spice_pwd_decrypted, args: Vec::new() }
    }

    fn build(mut self) -> Result<Vec<String>, ConnectError> {
        self.add_base_uri();
        self.add_vapp_info();
        Ok(self.args)
    }

    fn add_base_uri(&mut self) {
        let parts: Vec<&str> = self.vapp_info.desktop.spice_url.splitn(2, ':').collect();
        let host = parts.get(0).unwrap_or(&"");
        let port_and_path: Vec<&str> = parts.get(1).unwrap_or(&"").splitn(2, '/').collect();
        let port = port_and_path.get(0).unwrap_or(&"");
        self.args.push("-h".into());
        self.args.push(host.to_string());
        self.args.push("-p".into());
        self.args.push(port.to_string());
        self.args.push("-w".into());
        self.args.push(self.spice_pwd_decrypted.to_string());
    }

    fn add_vapp_info(&mut self) {
        self.args.push(format!("--run-vapp=\"{}\"", self.vapp_info.target));
        self.args.push(format!("--title=\"{}\"", self.vapp_info.name));
    }
}
