use crate::services::request::CustomError;
use thiserror::Error;
use url::ParseError;

#[derive(Debug, Error)]
pub enum WsError {
    #[error("Gateway not configured")]
    GatewayNotConfigured,

    #[error("Failed to parse WebSocket URL: {0}")]
    UrlParse(#[from] ParseError),

    #[error("I/O Error: {0}")]
    Io(#[from] std::io::Error),

    #[error("TLS Error: {0}")]
    Tls(String),

    #[error("WebSocket connection error: {0}")]
    WebSocket(#[from] tokio_tungstenite::tungstenite::Error),

    #[error("API request error: {0}")]
    Api(#[from] reqwest::Error),

    #[error("JSON serialization/deserialization error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Service layer error: {0}")]
    Service(#[from] CustomError),

    #[error("Client online request failed: {0}")]
    ClientOnlineFailed(String),
}

impl serde::Serialize for WsError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

impl From<String> for WsError {
    fn from(s: String) -> Self {
        WsError::ClientOnlineFailed(s)
    }
}
