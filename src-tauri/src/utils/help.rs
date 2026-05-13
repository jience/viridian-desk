use anyhow::{Context, Result};
use tracing::error;
use serde::{de::DeserializeOwned, Serialize};
use std::{fs, path::PathBuf};

/// read data from JSON file as struct T
pub fn read_json<T: DeserializeOwned>(path: &PathBuf) -> Result<T> {
    if !path.exists() {
        error!("JSON file not found: {}", path.display());
    }

    let json_str = fs::read_to_string(path)
        .with_context(|| format!("Failed to read the JSON file: {}", path.display()))?;

    serde_json::from_str::<T>(&json_str)
        .with_context(|| format!("Failed to parse the JSON file: {}", path.display()))
}

/// save the data to the JSON file
pub fn save_json<T: Serialize>(path: &PathBuf, data: &T) -> Result<()> {
    let json_str = serde_json::to_string_pretty(data)?;

    let path_str = path.as_os_str().to_string_lossy().to_string();
    fs::write(path, json_str.as_bytes())
        .with_context(|| format!("Failed to write JSON file \"{}\"", path_str))
}

/// read data from YAML as struct T
pub fn read_yaml<T: DeserializeOwned>(path: &PathBuf) -> Result<T> {
    if !path.exists() {
        error!("YAML file not found: {}", path.display());
    }

    let yaml_str = fs::read_to_string(path)
        .with_context(|| format!("Failed to read the YAML file: {}", path.display()))?;

    serde_yaml::from_str::<T>(&yaml_str)
        .with_context(|| format!("Failed to parse the YAML file: {}", path.display()))
}

/// save the data to the YAML file
/// can set `prefix` string to add some comments
pub fn save_yaml<T: Serialize>(path: &PathBuf, data: &T, prefix: Option<&str>) -> Result<()> {
    let data_str = serde_yaml::to_string(data)?;

    let yaml_str = match prefix {
        Some(prefix) => format!("{}\n\n{}", prefix, data_str),
        None => data_str,
    };

    let path_str = path.as_os_str().to_string_lossy().to_string();
    fs::write(path, yaml_str.as_bytes())
        .with_context(|| format!("Failed to write YAML file \"{}\"", path_str))
}
