use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::app::state::GatewayConf;
use crate::services::request::{fetch_data, fetch_static_file, CustomError, ResponseData};

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all(deserialize = "camelCase"))]
pub struct OnlineTerminalResp {
    pub heartbeat_interval: u64,
    pub timezone: String,
    pub terminal_name: String,
    pub integration: bool,
    pub is_force_upgrade: bool,
    pub next_version: Option<String>,
    pub ntp_server_ip: String,
    pub file_server_path: Option<String>,
    pub proxy: Option<ProxyConfig>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all(deserialize = "camelCase"))]
pub struct ProxyConfig {
    api_port: Option<u16>,
    download_port: Option<u16>,
    pub socket_port: Option<u16>,
    pub spice_port: Option<u16>,
    pub ip: Option<String>,
}

pub async fn get_terminal_config(request_body: &Value) -> Result<ResponseData, CustomError> {
    // 调用 HTTP 请求函数
    let data = fetch_data("/getTerminalConfig", request_body).await?;
    Ok(data)
}

pub async fn online_terminal(request_body: &Value) -> Result<ResponseData, CustomError> {
    let mut body = request_body.clone();
    if let Some(obj) = body.as_object_mut() {
        obj.remove("clientType");
        obj.remove("isThin");
    }
    // 调用 HTTP 请求函数
    let data = fetch_data("/onlineTerminal", &body).await?;
    Ok(data)
}

pub async fn get_desktop(request_body: &Value) -> Result<ResponseData, CustomError> {
    // 调用 HTTP 请求函数
    let data = fetch_data("/retrieveDesktop", request_body).await?;
    Ok(data)
}

pub async fn get_desktop_spice_add(request_body: &Value) -> Result<ResponseData, CustomError> {
    // 调用 HTTP 请求函数
    let data = fetch_data("/getDesktopSpiceAddress", request_body).await?;
    Ok(data)
}

pub async fn enter_desktop(desktop_id: &str) -> Result<ResponseData, CustomError> {
    let request_body = &json!({"desktopId": desktop_id});
    let data = fetch_data("/enterDesktop", request_body).await?;
    Ok(data)
}

pub async fn exit_desktop(desktop_id: &str) -> Result<ResponseData, CustomError> {
    let request_body = &json!({"desktopId": desktop_id});
    let data = fetch_data("/exitDesktop", request_body).await?;
    Ok(data)
}

pub async fn get_vapp(request_body: &Value) -> Result<ResponseData, CustomError> {
    let data = fetch_data("/getVapp", request_body).await?;
    Ok(data)
}

pub async fn enter_vapp(vapp_id: &str, desktop_id: &str) -> Result<ResponseData, CustomError> {
    let request_body = &json!({"id": vapp_id, "desktopId": desktop_id});
    let data = fetch_data("/enterVapp", request_body).await?;
    Ok(data)
}

pub async fn exit_vapp(vapp_id: &str, desktop_id: &str) -> Result<ResponseData, CustomError> {
    let request_body = &json!({"id": vapp_id, "desktopId": desktop_id});
    let data = fetch_data("/exitVapp", request_body).await?;
    Ok(data)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpgradeInfo {
    md5sum: String,
    version_name: String,
    update_description: String,
    file_path: String,
    download_port: String,
    // 补充其他字段
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NullUpgradeInfo {}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum UpgradeRes {
    Upgrade(UpgradeInfo),
    NullUpgrade(NullUpgradeInfo),
}

pub async fn check_upgrade(request_body: &Value) -> Result<UpgradeRes, CustomError> {
    // 终端版本检查更新
    let mut res: UpgradeRes = UpgradeRes::NullUpgrade(NullUpgradeInfo {});
    let data = fetch_data("/checkUpgrade", request_body).await?;
    if let Value::Object(obj) = &data.data {
        if obj.is_empty() == false {
            let upgrade_info: UpgradeInfo = serde_json::from_value(data.data).unwrap();
            res = UpgradeRes::Upgrade(upgrade_info);
        }
    }
    // let upgrade_info: UpgradeInfo = serde_json::from_value(data.data).unwrap();
    // let res: UpgradeRes = UpgradeRes::Upgrade(upgrade_info);
    Ok(res)
}

pub async fn request_static_file(gateway_conf: &mut GatewayConf) {
    let (logo_white_res, client_icon_png_res, client_icon_ico_res, background_image_res) = tokio::join!(
        fetch_static_file(&gateway_conf.logo_white),
        fetch_static_file(&gateway_conf.client_icon_png),
        fetch_static_file(&gateway_conf.client_icon_ico),
        fetch_static_file(&gateway_conf.background_image),
    );

    if let Ok(r) = logo_white_res {
        gateway_conf.logo_white = r;
    }
    if let Ok(r) = client_icon_png_res {
        gateway_conf.client_icon_png = r;
    }
    if let Ok(r) = client_icon_ico_res {
        gateway_conf.client_icon_ico = r;
    }
    if let Ok(r) = background_image_res {
        gateway_conf.background_image = r;
    }
}
