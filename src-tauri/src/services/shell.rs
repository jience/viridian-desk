use crate::core::sidecar::{get_usb_devices_from_sidecar, UsbDeviceInfo};
use anyhow::{anyhow, Context, Result};
use std::process::Stdio;
use tauri::AppHandle;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::{Child, Command};
use tracing::{debug, error, info};

pub const HDP_VIEWER_COMMAND: &str = "hdp-viewer";
pub const HDP_VAPP_COMMAND: &str = "hdp-vapp";
pub const INPUT_ACTIVITY_MONITOR_COMMAND: &str = "input-activity-monitor";
#[cfg(feature = "thin_client")]
const TC_SKU_GEN_COMMAND: &str = "tc-sku-gen";

pub async fn run_hdp_command(command_name: &str, spice_args: Vec<String>) -> Result<Child> {
    debug!("Attempting to run {} with args: {:?}",command_name, &spice_args);

    let child = Command::new(command_name)
        .args(&spice_args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .context(format!("Failed to spawn {} process", command_name))?;

    Ok(child)
}

pub async fn log_hdp_viewer_output(mut child: Child) -> Result<()> {
    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| anyhow!("Failed to open stdout for {}", HDP_VIEWER_COMMAND))?;
    let stderr = child
        .stderr
        .take()
        .ok_or_else(|| anyhow!("Failed to open stderr for {}", HDP_VIEWER_COMMAND))?;

    let mut stdout_reader = BufReader::new(stdout).lines();
    let mut stderr_reader = BufReader::new(stderr).lines();

    // stdout task
    let stdout_task = tokio::spawn(async move {
        while let Ok(Some(line)) = stdout_reader.next_line().await {
            debug!(target: "hdp::stdout", "{}", line);
        }
    });

    // stderr task
    let stderr_task = tokio::spawn(async move {
        while let Ok(Some(line)) = stderr_reader.next_line().await {
            error!(target: "hdp::stderr", "{}", line);
        }
    });

    tokio::select! {
        // todo: 接收窗口关闭信号, child.kill()
        // _ = tx => {
        //     if let Err(e) = child.kill().await {
        //         error!("failed to kill process: {}", e);
        //     }
        // }

        // 子进程完成或被终止
        result = child.wait() => {
            match result {
                Ok(status) => {
                    if status.success() {
                        info!("{} process completed successfully.", HDP_VIEWER_COMMAND);
                    } else {
                        info!("{} process exited with status: {}", HDP_VIEWER_COMMAND, status);
                    }
                },
                Err(e) => {
                    error!("Failed to wait on {} process: {}", HDP_VIEWER_COMMAND, e);
                },
            }
        }
    }

    // Wait for logging tasks to complete
    let _ = tokio::join!(stdout_task, stderr_task);

    Ok(())
}

/// Kills a process by its name. This is a generic utility function.
pub async fn kill_process_by_name(process_name: &str) -> Result<(), String> {
    info!(
        "Attempting to kill all running '{}' processes.",
        process_name
    );

    #[cfg(target_os = "windows")]
    let kill_cmd_output = {
        use crate::utils::constant::CREATE_NO_WINDOW;
        use std::os::windows::process::CommandExt;
        Command::new("taskkill")
            .args(&["/F", "/IM", &format!("{}.exe", process_name)])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .await
    };

    #[cfg(not(target_os = "windows"))]
    let kill_cmd_output = Command::new("pkill").arg(process_name).output().await;

    match kill_cmd_output {
        Ok(output) => {
            if output.status.success() {
                info!(
                    "Successfully issued command to kill '{}' processes.",
                    process_name
                );
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr);
                let stdout = String::from_utf8_lossy(&output.stdout);
                // On Linux, pkill exits with 1 if no processes are found.
                // On Windows, taskkill exits with 128 and prints an error if no processes are found.
                // These are not considered errors in this context.
                if (output.status.code() == Some(1) && cfg!(not(target_os = "windows")))
                    || (output.status.code() == Some(128)
                        && cfg!(target_os = "windows")
                        && (stdout.contains("not found") || stderr.contains("not found")))
                {
                    info!("No running '{}' processes found to kill.", process_name);
                } else {
                    let err_msg = format!(
                        "Failed to kill '{}' processes. Status: {}. Stderr: {}. Stdout: {}",
                        process_name, output.status, stderr, stdout
                    );
                    error!("{}", err_msg);
                    // Unlike the "not found" case, this is a real error.
                    return Err(err_msg);
                }
            }
        }
        Err(e) => {
            let err_msg = format!("Error executing kill command for '{}': {}", process_name, e);
            error!("{}", err_msg);
            return Err(err_msg);
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn kill_all_hdp_viewers() -> Result<(), String> {
    kill_process_by_name(HDP_VIEWER_COMMAND).await
}

#[tauri::command]
pub async fn kill_all_hdp_vapp() -> Result<(), String> {
    kill_process_by_name(HDP_VAPP_COMMAND).await
}

#[tauri::command]
pub async fn kill_all_input_activity_monitors() -> Result<(), String> {
    kill_process_by_name(INPUT_ACTIVITY_MONITOR_COMMAND).await
}

#[tauri::command]
pub async fn list_usb_devices(app_handle: AppHandle) -> Vec<UsbDeviceInfo> {
    get_usb_devices_from_sidecar(&app_handle).await
}

#[cfg(feature = "thin_client")]
/// Attempts to generate a SKU by executing the shell command.
pub async fn get_tc_sku_from_shell() -> Result<String> {
    info!("Attempting to get SKU from '{}'", TC_SKU_GEN_COMMAND);

    let command_output = Command::new(TC_SKU_GEN_COMMAND)
        .output()
        .await
        .with_context(|| format!("Failed to execute '{}' command", TC_SKU_GEN_COMMAND))?;

    if command_output.status.success() {
        let sku = String::from_utf8(command_output.stdout)
            .context("Failed to read SKU from stdout")?
            .trim()
            .to_string();

        if sku.is_empty() {
            Err(anyhow!(
                "'{}' command returned an empty SKU",
                TC_SKU_GEN_COMMAND
            ))
        } else {
            debug!("Successfully got SKU from shell: {}", sku);
            Ok(sku)
        }
    } else {
        let stderr = String::from_utf8_lossy(&command_output.stderr);
        error!(
            "'{}' command failed with status: {:?}",
            TC_SKU_GEN_COMMAND, command_output.status
        );
        error!("stderr: {}", stderr);
        Err(anyhow!(
            "Failed to get SKU. Status: {:?}. Details: {}",
            command_output.status,
            stderr
        ))
    }
}
