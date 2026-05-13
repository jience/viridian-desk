use anyhow::anyhow;
use regex::Regex;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Wry};
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;
use tracing::{debug, error, info, warn};

const TERMINAL_UUID_GEN_SIDECAR: &str = "terminal-uuid-gen";
const TERMINAL_MODEL_SIDECAR: &str = "terminal-model";
const NET_PROBE_SIDECAR: &str = "net-probe";
const USB_DEVICE_PROBE_SIDECAR: &str = "usb-device-probe";

#[derive(Deserialize, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ClientDeviceType {
    Sc, // soft client
    Tc, // thin client
}

#[derive(Deserialize, Debug)]
pub struct TerminalModel {
    pub client_device_type: ClientDeviceType,
    pub client_type: String,
    pub client_os: String,
    pub client_os_version: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NetProbe {
    pub name: String,
    pub mac: String,
    pub ipv4: String,
    pub netmask: String,
    pub cidr: String,
    #[serde(rename = "dhcpEnabled")]
    pub dhcp_enabled: u8,
    pub family: String,
    pub gateway: String,
    pub internal: u8,
    pub status: String,
    pub speed: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all(serialize = "UPPERCASE"))]
pub struct UsbDeviceInfo {
    vid: String,
    pid: String,
    device_name: String,
    device_type: String,
}

/// Attempts to generate a UUID by executing the sidecar binary.
pub async fn get_uuid_from_sidecar(app_handle: &AppHandle<Wry>) -> anyhow::Result<String> {
    let sidecar_command = app_handle.shell().sidecar(TERMINAL_UUID_GEN_SIDECAR)?;
    let (mut rx, _child) = sidecar_command
        .spawn()
        .expect("Failed to spawn [terminal-uuid-gen] sidecar command");

    let mut stdout_bytes = Vec::new();
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(chunk) => {
                stdout_bytes.extend_from_slice(&chunk);
            }
            CommandEvent::Stderr(line) => {
                warn!(
                    "[terminal-uuid-gen] stderr: {}",
                    String::from_utf8_lossy(&line)
                );
            }
            CommandEvent::Terminated(payload) => {
                if payload.code != Some(0) {
                    return Err(anyhow!(
                        "terminal-uuid-gen terminated with non-zero exit code: {:?}",
                        payload.code
                    ));
                }
            }
            _ => {}
        }
    }

    let uuid = String::from_utf8(stdout_bytes)?.trim().to_string();
    if uuid.is_empty() {
        return Err(anyhow!("Sidecar returned an empty UUID"));
    }

    debug!("Successfully got UUID from sidecar: {}", uuid);
    Ok(uuid)
}

/// Attempts to get terminal model info by executing the sidecar binary.
pub async fn get_terminal_model_from_sidecar(
    app_handle: &AppHandle<Wry>,
) -> anyhow::Result<TerminalModel> {
    let sidecar_command = app_handle
        .shell()
        .sidecar(TERMINAL_MODEL_SIDECAR)?
        .args(["-j"]);
    let (mut rx, _child) = sidecar_command
        .spawn()
        .expect("Failed to spawn [terminal-model] sidecar command");

    let mut stdout_bytes = Vec::new();
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(chunk) => {
                stdout_bytes.extend_from_slice(&chunk);
            }
            CommandEvent::Stderr(line) => {
                warn!(
                    "[terminal-model] stderr: {}",
                    String::from_utf8_lossy(&line)
                );
            }
            CommandEvent::Terminated(payload) => {
                if payload.code != Some(0) {
                    return Err(anyhow!(
                        "terminal-model terminated with non-zero exit code: {:?}",
                        payload.code
                    ));
                }
            }
            _ => {}
        }
    }

    let output_str = String::from_utf8(stdout_bytes)?;
    if output_str.is_empty() {
        return Err(anyhow!(
            "Sidecar [terminal-model] returned an empty response"
        ));
    }

    let model: TerminalModel = serde_json::from_str(&output_str)
        .map_err(|e| anyhow!("Failed to parse terminal model from sidecar: {}", e))?;

    debug!("Successfully got terminal model from sidecar: {:?}", model);
    Ok(model)
}

/// Attempts to get native network info by executing the sidecar binary.
pub async fn get_net_probe_from_sidecar(
    app_handle: &AppHandle<Wry>,
) -> anyhow::Result<Vec<NetProbe>> {
    let sidecar_command = app_handle.shell().sidecar(NET_PROBE_SIDECAR)?.args(["-j"]);
    let (mut rx, _child) = sidecar_command
        .spawn()
        .expect("Failed to spawn [net-probe] sidecar command");

    let mut stdout_bytes = Vec::new();
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(chunk) => {
                stdout_bytes.extend_from_slice(&chunk);
            }
            CommandEvent::Stderr(line) => {
                warn!("[net-probe] stderr: {}", String::from_utf8_lossy(&line));
            }
            CommandEvent::Terminated(payload) => {
                if payload.code != Some(0) {
                    return Err(anyhow!(
                        "net-probe terminated with non-zero exit code: {:?}",
                        payload.code
                    ));
                }
            }
            _ => {}
        }
    }

    let output_str = String::from_utf8(stdout_bytes)?;
    if output_str.is_empty() {
        return Err(anyhow!("Sidecar [net-probe] returned an empty response"));
    }

    let net_probes: Vec<NetProbe> = serde_json::from_str(&output_str)
        .map_err(|e| anyhow!("Failed to parse net probe from sidecar: {}", e))?;

    debug!("Successfully got net probe from sidecar: {:?}", net_probes);
    Ok(net_probes)
}

/// Attempts to get usb devices info by executing the sidecar binary.
pub async fn get_usb_devices_from_sidecar(app_handle: &AppHandle<Wry>) -> Vec<UsbDeviceInfo> {
    let command_output = match app_handle.shell().sidecar(USB_DEVICE_PROBE_SIDECAR) {
        Ok(cmd) => match cmd.output().await {
            Ok(output) => output,
            Err(e) => {
                error!(
                    "Failed to execute '{}' sidecar command: {}",
                    USB_DEVICE_PROBE_SIDECAR, e
                );
                return vec![];
            }
        },
        Err(e) => {
            error!(
                "Failed to create '{}' sidecar command: {}",
                USB_DEVICE_PROBE_SIDECAR, e
            );
            return vec![];
        }
    };

    if command_output.status.success() {
        info!(
            "'{}' sidecar command executed successfully",
            USB_DEVICE_PROBE_SIDECAR
        );
        let stdout = String::from_utf8_lossy(&command_output.stdout);

        let re = match Regex::new(
            r"VID:\[(\w+)],PID:\[(\w+)],DEVICE_NAME:\[([^]]+)],DEVICE_TYPE:\[(\w+)]",
        ) {
            Ok(r) => r,
            Err(e) => {
                error!("Failed to compile regex: {}", e);
                return vec![];
            }
        };

        let list_usb_info: Vec<UsbDeviceInfo> = stdout
            .lines()
            .filter_map(|line| {
                re.captures(line).map(|caps| UsbDeviceInfo {
                    vid: caps[1].to_string(),
                    pid: caps[2].to_string(),
                    device_name: caps[3].to_string(),
                    device_type: caps[4].to_string(),
                })
            })
            .collect();

        info!("Parsed USB devices: {:?}", list_usb_info);
        list_usb_info
    } else {
        let stderr = String::from_utf8_lossy(&command_output.stderr);
        error!(
            "'{}' sidecar command failed with status: {:?}",
            USB_DEVICE_PROBE_SIDECAR, command_output.status
        );
        error!("stderr: {}", stderr);
        vec![]
    }
}
