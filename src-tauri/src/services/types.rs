use super::policy::TerminalPolicy;
use crate::services::request::CustomError;
use serde::Deserialize;
use std::fmt;
use thiserror::Error;

/// --- Custom Error Type with `thiserror` ---
#[derive(Debug, Error)]
pub enum ConnectError {
    #[error("API request failed: {0}")]
    ApiError(#[from] CustomError),

    #[error("Failed to parse API response: {0}")]
    DeserializationError(#[from] serde_json::Error),

    #[error("Failed to decrypt sensitive data: {0}")]
    DecryptionError(String),

    #[error("Failed to encrypt sensitive data: {0}")]
    EncryptionError(String),

    #[error("Desktop is not in a connectable state. Current status: '{0}'")]
    InvalidDesktopStatus(String),

    #[error("Access denied by policy: {0}")]
    AccessDenied(String),

    // #[error("An unknown error occurred")]
    // Unknown,
}

/// --- Allow Tauri to serialize the error for the frontend ---
impl serde::Serialize for ConnectError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

/// --- Enums and Structs with improved type safety ---
#[derive(Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(rename_all = "PascalCase")]
pub enum DesktopStatus {
    Start,
    Stop,
    Error,
}

impl fmt::Display for DesktopStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Deserialize, Debug, Clone)]
pub struct DesktopInfo {
    pub name: String,
    pub status: DesktopStatus,
    pub os: String,
    #[serde(rename = "policyConnectionValue")]
    pub policy_connection_value: DesktopPolicyConnectionValue,
    #[serde(rename = "cvmIp")]
    pub cvm_ip: String,
    #[serde(rename = "domainServer")]
    pub domain_server: Option<DomainServerInfo>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct DesktopPolicyConnectionValue {
    pub protocol: Vec<String>,
    #[serde(rename = "terminalPolicy")]
    pub terminal_policy: TerminalPolicy,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DomainServerInfo {
    pub domain_name: String,
    pub desktop_login_name: String,
}

#[derive(Deserialize, Debug)]
pub struct DesktopSpiceInfo {
    #[serde(rename = "consoleUrl")]
    pub console_url: String,
    pub pwd: String,
    pub subject: String,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GetDesktopRequest<'a> {
    pub id: &'a str,
    pub is_active: bool,
    pub is_return_policy_connection_value: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub login_name: Option<&'a str>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VappInfo {
    // pub id: String,
    pub name: String,
    pub target: String,
    // pub category: String,
    // pub img_url: String,
    // pub icon_url: String,
    // pub publish_type: String,
    pub desktop: DesktopInfoFroVapp,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DesktopInfoFroVapp {
    pub id: String,
    // pub name: String,
    pub status: DesktopStatus,
    #[serde(rename = "spiceURL")]
    pub spice_url: String,
    pub spice_password: String,
}
