use crate::app::state::AppState;
use crate::config::client::AppConf;
use crate::core::handle::Handle;
use crate::utils::dirs::app_cache_dir;
use anyhow::{Context, Result};
use http::{HeaderMap, HeaderValue, Method};
use once_cell::sync::Lazy;
use reqwest::{Client, RequestBuilder, Response, StatusCode};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs::File;
use std::io::Write;
use std::time::Duration;
use tauri::Manager;
use thiserror::Error;
use tracing::{debug, error};
use uuid::Uuid;

const HTTP_POOL_MAX_IDLE_CONNECTION: usize = 10;
const HTTP_POOL_IDLE_TIMEOUT: u64 = 30;

static HTTP_CLIENT: Lazy<Result<Client, reqwest::Error>> = Lazy::new(|| {
    Client::builder()
        .danger_accept_invalid_certs(true) // WARNING: This should be false in production
        .pool_idle_timeout(Duration::from_secs(HTTP_POOL_IDLE_TIMEOUT))
        .pool_max_idle_per_host(HTTP_POOL_MAX_IDLE_CONNECTION)
        .timeout(Duration::from_secs(5))
        .build()
});

fn get_http_client() -> Result<&'static Client> {
    HTTP_CLIENT
        .as_ref()
        .map_err(|e| anyhow::anyhow!("Failed to create HTTP client: {}", e))
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseData {
    pub request_id: String,
    pub data: Value,
}

#[derive(Debug, Error)]
pub enum CustomError {
    #[error("HTTP client initialization failed: {0}")]
    ClientInitializationError(String),

    #[error("Request failed with status: {status} for url: {url}")]
    RequestFailed { status: StatusCode, url: String },

    #[error("Network or connection error: {0}")]
    ConnectionError(#[from] reqwest::Error),

    #[error("Failed to parse JSON response: {0}")]
    JsonParseError(#[from] serde_json::Error),

    #[error("Filesystem error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Configuration error: {0}")]
    ConfigError(String),
}

async fn request_interceptor(req: RequestBuilder) -> Result<RequestBuilder> {
    let mut headers = HeaderMap::new();
    let request_id = Uuid::new_v4().to_string();

    headers.insert(
        "X-Request-Id",
        HeaderValue::from_str(&request_id).context("Failed to create Request-Id header")?,
    );
    headers.insert("Content-Type", HeaderValue::from_static("application/json"));

    if let Some(app_handle) = Handle::global().app_handle() {
        let app_state: tauri::State<AppState> = app_handle.state();
        let terminal_info = app_state.terminal_info.lock().await;
        headers.insert(
            "X-Device-Id",
            HeaderValue::from_str(&terminal_info.id)
                .context("Failed to create X-Device-Id header")?,
        );

        let auth = app_state.auth.lock().await;
        if let Some(user) = &auth.user {
            if !user.user_id.is_empty() {
                headers.insert(
                    "visitorId",
                    HeaderValue::from_str(&user.user_id)
                        .context("Failed to create visitorId header")?,
                );
            }
        }
    }
    Ok(req.headers(headers))
}

async fn response_interceptor(resp: Response) -> Result<Response, reqwest::Error> {
    debug!("Response intercepted: {:?}", resp);
    Ok(resp)
}

pub async fn fetch_data(url_prefix: &str, json_data: &Value) -> Result<ResponseData, CustomError> {
    let client =
        get_http_client().map_err(|e| CustomError::ClientInitializationError(e.to_string()))?;
    let base_url = AppConf::read().get_request_base_url();
    if base_url.is_empty() {
        return Err(CustomError::ConfigError(
            "Gateway address is not configured.".to_string(),
        ));
    }
    let url = format!("{}{}", base_url, url_prefix);

    let request = client.request(Method::POST, &url).json(json_data);
    let request = request_interceptor(request)
        .await
        .map_err(|e| CustomError::ConfigError(e.to_string()))?;

    let response = request.send().await?;
    let response = response_interceptor(response).await?;

    if response.status().is_success() {
        let content = response.text().await?;
        let resp_data: ResponseData = serde_json::from_str(&content)?;
        debug!("Response body: {:?}", &resp_data);
        Ok(resp_data)
    } else {
        let status = response.status();
        error!("Request to {} failed with status: {}", url, status);
        Err(CustomError::RequestFailed { status, url })
    }
}

pub async fn fetch_static_file(path: &str) -> Result<String, CustomError> {
    let client =
        get_http_client().map_err(|e| CustomError::ClientInitializationError(e.to_string()))?;

    let file_name = path
        .split('/')
        .last()
        .ok_or_else(|| CustomError::ConfigError(format!("Invalid static file path: {}", path)))?;

    let cache_dir = app_cache_dir()
        .map_err(|e| CustomError::ConfigError(format!("Failed to get cache dir: {}", e)))?;
    let file_path = cache_dir.join(file_name);
    let file_str = file_path.to_string_lossy().to_string();

    if file_path.exists() {
        debug!("Cache static file exists: {}", file_str);
        return Ok(file_str);
    }
    debug!("Caching static file to: {}", file_str);

    let cur_gateway = AppConf::read()
        .get_current_gateway()
        .ok_or_else(|| CustomError::ConfigError("No current gateway configured".to_string()))?;

    let url = format!("https://{}:11609/{}", cur_gateway.address, path);
    let response = client.get(&url).send().await?;

    if response.status().is_success() {
        let bytes = response.bytes().await?;
        let mut file = File::create(&file_path)?;
        file.write_all(&bytes)?;
        Ok(file_str)
    } else {
        let status = response.status();
        error!("Request to {} failed with status: {}", url, status);
        Err(CustomError::RequestFailed { status, url })
    }
}
