use crate::utils::dirs;
use crate::utils::help;
use anyhow::Result;
use tracing::error;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Default, Debug, Clone, Deserialize, Serialize)]
pub struct Metadata {
    pub build_timestamp: u64,
    pub version: String,
    pub md5sum: String,
    pub signature: String,
    pub package_name: String,
    pub module_name: String,
    pub support_module_names: String,
    pub update_description: Option<String>,
}

impl Metadata {
    pub fn default() -> Self {
        Self {
            build_timestamp: Self::get_current_timestamp(),
            version: String::from("2.0.1"),
            md5sum: String::from(""),
            signature: String::from(""),
            package_name: String::from(""),
            module_name: String::from(""),
            support_module_names: String::from(""),
            update_description: Some("".into()),
        }
    }

    fn get_current_timestamp() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }

    pub fn new() -> Self {
        dirs::app_metadata_path()
            .and_then(|path| help::read_yaml::<Metadata>(&path))
            .unwrap_or_else(|error| {
                error!("{}", error);
                Self::default()
            })
    }

    pub fn save_file(&self) -> Result<()> {
        help::save_yaml(
            &dirs::app_metadata_path()?,
            &self,
            Some("# Metadata Config"),
        )
    }
}
