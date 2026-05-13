use crate::services::api::OnlineTerminalResp;
use std::fs;
use std::process::Command;
use tracing::{error, info};

#[cfg(target_os = "linux")]
async fn set_timezone(timezone: &str) -> Result<(), String> {
    info!("Setting timezone to {}", timezone);
    let status = Command::new("timedatectl")
        .arg("set-timezone")
        .arg(timezone)
        .status()
        .map_err(|e| format!("Failed to execute timedatectl: {}", e))?;

    if status.success() {
        info!("Timezone set successfully");
        Ok(())
    } else {
        let err_msg = format!("Failed to set timezone, exit code: {:?}", status.code());
        error!("{}", err_msg);
        Err(err_msg)
    }
}

#[cfg(target_os = "linux")]
async fn set_ntp_server(ntp_server: &str) -> Result<(), String> {
    info!("Setting NTP server to {}", ntp_server);
    let conf_path = "/etc/systemd/timesyncd.conf";

    // Read the configuration file
    let content = fs::read_to_string(conf_path)
        .map_err(|e| format!("Failed to read {}: {}", conf_path, e))?;

    // Modify the NTP server line
    let mut new_content = String::new();
    let mut ntp_line_found = false;
    for line in content.lines() {
        if line.trim_start().starts_with("NTP=") {
            new_content.push_str(&format!(
                "NTP={}
",
                ntp_server
            ));
            ntp_line_found = true;
        } else {
            new_content.push_str(line);
            new_content.push('\n');
        }
    }

    if !ntp_line_found {
        // Find the [Time] section and add the NTP line, or add the section if it doesn't exist
        if let Some(time_section_pos) = new_content.find("[Time]") {
            new_content.insert_str(
                time_section_pos + "[Time]".len(),
                &format!("\nNTP={}", ntp_server),
            );
        } else {
            new_content.push_str(&format!("\n[Time]\nNTP={}\n", ntp_server));
        }
    }

    // Write the modified content back
    fs::write(conf_path, new_content)
        .map_err(|e| format!("Failed to write to {}: {}", conf_path, e))?;
    info!("{} updated successfully.", conf_path);

    // Restart the systemd-timesyncd service
    info!("Restarting systemd-timesyncd service");
    let status = Command::new("systemctl")
        .arg("restart")
        .arg("systemd-timesyncd")
        .status()
        .map_err(|e| format!("Failed to execute systemctl: {}", e))?;

    if status.success() {
        info!("systemd-timesyncd service restarted successfully");
        Ok(())
    } else {
        let err_msg = format!(
            "Failed to restart systemd-timesyncd, exit code: {:?}",
            status.code()
        );
        error!("{}", err_msg);
        Err(err_msg)
    }
}

#[cfg(not(target_os = "linux"))]
async fn set_timezone(_timezone: &str) -> Result<(), String> {
    info!("Timezone setting is only supported on Linux.");
    Ok(())
}

#[cfg(not(target_os = "linux"))]
async fn set_ntp_server(_ntp_server: &str) -> Result<(), String> {
    info!("NTP server setting is only supported on Linux.");
    Ok(())
}

pub async fn apply_thin_settings(resp: &OnlineTerminalResp) -> Result<(), String> {
    info!("Applying thin client settings...");
    if let Err(e) = set_timezone(&resp.timezone).await {
        error!("Failed to set timezone: {}", e);
    }
    if let Err(e) = set_ntp_server(&resp.ntp_server_ip).await {
        error!("Failed to set NTP server: {}", e);
    }
    Ok(())
}

pub async fn start_integration() -> Result<(), String> {
    info!("Starting integration services...");
    // TODO: Implement integration start logic
    Ok(())
}
