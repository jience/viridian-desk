use crate::config::AppConf;
use crate::utils::dirs;
use anyhow::{Context, Result};
use std::process::Command;
use std::{
    fs::{self},
    path::{Path, PathBuf},
};
use tracing::{debug, error};
use uuid::Uuid;

pub fn app_root() -> Result<PathBuf> {
    dirs::app_home_dir().context("Failed to determine app home directory")
}

pub fn exists(path: &Path) -> bool {
    Path::new(path).exists()
}

pub fn create_file<P: AsRef<Path>>(filename: P) -> Result<()> {
    let filename = filename.as_ref();
    if let Some(parent) = filename.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)?;
        }
    }
    fs::File::create(filename)?;
    Ok(())
}

pub fn generate_device_uuid() -> String {
    // First, try to get a hardware-based serial number
    match get_disk_serial_number() {
        Ok(serial) => {
            let device_uuid = Uuid::new_v5(&Uuid::NAMESPACE_URL, serial.as_bytes()).to_string();
            debug!("Generated device UUID (from hardware): {}", device_uuid);
            device_uuid
        }
        Err(e) => {
            error!("Could not generate hardware-based device UUID: {}. Falling back to config-based UUID.", e);
            // If hardware-based fails, get it from config, or generate a new one and save it.
            let mut conf = AppConf::read();
            if !conf.client_id.is_empty() {
                debug!(
                    "Using existing device UUID (from config): {}",
                    conf.client_id
                );
                return conf.client_id;
            }

            let new_uuid = Uuid::new_v4().to_string();
            error!(
                "No existing UUID found. Generated a new random UUID: {}",
                new_uuid
            );
            conf.client_id = new_uuid.clone();
            conf.write().expect("Failed to write UUID");
            new_uuid
        }
    }
}

/// Uses the serial number of the first disk drive as a unique device identifier.
fn get_disk_serial_number() -> Result<String> {
    let (command, args) = if cfg!(target_os = "windows") {
        ("wmic", vec!["diskdrive", "get", "serialnumber"])
    } else if cfg!(target_os = "linux") {
        ("lsblk", vec!["-o", "SERIAL"])
    } else if cfg!(target_os = "macos") {
        (
            "ioreg",
            vec!["-c", "IOBlockStorageDriver", "-k", "SerialNumber"],
        )
    } else {
        // Fallback for other OSes, though it's unlikely to be a reliable unique ID.
        ("cat", vec!["/proc/sys/kernel/random/boot_id"])
    };

    let output = Command::new(command)
        .args(args)
        .output()
        .with_context(|| format!("Failed to execute command: '{}'", command))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(anyhow::anyhow!(
            "'{}' command failed with status {}: {}",
            command,
            output.status,
            stderr
        ));
    }

    let stdout = String::from_utf8(output.stdout).context("Command output was not valid UTF-8")?;

    let serial_number = stdout
        .lines()
        .nth(1) // The serial number is usually on the second line.
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .context("Could not find a valid serial number in the command output")?;

    Ok(serial_number.to_string())
}

pub fn capitalize_first_letter(s: &str) -> String {
    if s.is_empty() {
        return String::new();
    }
    s[0..1].to_uppercase() + &s[1..]
}
