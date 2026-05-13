use tracing::debug;
use serde::Serialize;
use tauri::Emitter;

use super::constants::EVENT_CLIENT_ONLINE;

#[derive(Clone, Debug, Serialize)]
struct Payload {
    is_online: bool,
}

pub async fn send_online_event(app_win: &tauri::WebviewWindow, is_online: bool) {
    debug!("send client online event to fronted");
    let msg_payload = Payload { is_online };
    app_win.emit(EVENT_CLIENT_ONLINE, msg_payload).unwrap();
}
