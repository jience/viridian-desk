use crate::core::handle;
use anyhow::Result;
use tracing::error;
use std::path::PathBuf;
use tauri::Manager;

pub static APP_ID: &str = "com.viridian.desk";
pub static APP_CONFIG: &str = "client.config.json";
pub static APP_METADATA: &str = "metadata.yaml";

/// get the client app home dir
pub fn app_home_dir() -> Result<PathBuf> {
    let app_handle = handle::Handle::global().app_handle().unwrap();

    match app_handle.path().config_dir() {
        Ok(dir) => Ok(dir.join(APP_ID)),
        Err(e) => {
            error!("Failed to get the app home directory: {}", e);
            Err(anyhow::anyhow!("Failed to get the app home directory"))
        }
    }
}

/// app config path
pub fn app_config_path() -> Result<PathBuf> {
    Ok(app_home_dir()?.join(APP_CONFIG))
}

/// app metadata.json path
pub fn app_metadata_path() -> Result<PathBuf> {
    Ok(app_home_dir()?.join(APP_METADATA))
}

/// logs dir
pub fn app_logs_dir() -> Result<PathBuf> {
    let app_handle = handle::Handle::global().app_handle().unwrap();
    match app_handle.path().app_log_dir() {
        Ok(dir) => Ok(dir),
        Err(e) => {
            error!("Failed to get the app log directory: {}", e);
            Err(anyhow::anyhow!("Failed to get the app log directory"))
        }
    }
}

pub fn app_cache_dir() -> Result<PathBuf> {
    Ok(app_home_dir()?.join("cache"))
}
