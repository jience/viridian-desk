use tracing::debug;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, EventTarget};

use super::constants::EVENT_DESKTOP_CONNECT;

#[derive(Clone, Debug, Serialize, Deserialize)]
struct Payload {
    desktop_id: String,
    is_connected: bool,
}

pub async fn send_connect_event(app: tauri::AppHandle, desktop_id: String, is_connected: bool) {
    let msg_payload = Payload {
        desktop_id,
        is_connected,
    };
    app.emit_to(
        EventTarget::webview_window("main"),
        EVENT_DESKTOP_CONNECT,
        msg_payload,
    )
    .unwrap();
    debug!("send desktop connect event to fronted");
}
