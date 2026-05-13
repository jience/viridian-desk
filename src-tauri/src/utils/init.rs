use crate::config::{AppConf, Metadata};
use crate::utils::{dirs, help};
use anyhow::Result;
use tracing::info;
use std::fs;

pub fn init_config() -> Result<()> {
    let app_config_home = dirs::app_home_dir()?;
    if !app_config_home.exists() {
        let _ = fs::create_dir_all(&app_config_home);
    }

    let app_config_path = dirs::app_config_path()?;
    if !app_config_path.exists() {
        info!("The client config path doesn't exist, will create it");
        help::save_json(&app_config_path, &AppConf::default())?;
    }

    let app_metadata_path = dirs::app_metadata_path()?;
    info!("app metadata path is {:?}", app_metadata_path);
    if !app_metadata_path.exists() {
        help::save_yaml(
            &app_metadata_path,
            &Metadata::default(),
            Some("# Metadata Config"),
        )?;
    }

    let app_logs_dir = dirs::app_logs_dir()?;
    if !app_logs_dir.exists() {
        let _ = fs::create_dir_all(&app_logs_dir);
    }

    let app_cache_dir = dirs::app_cache_dir()?;
    if !app_cache_dir.exists() {
        let _ = fs::create_dir_all(&app_cache_dir);
    }

    Ok(())
}
