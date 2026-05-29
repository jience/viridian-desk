use futures::stream::{SplitSink, SplitStream};
use futures::{SinkExt, StreamExt};
use tracing::{debug, error, info, warn};
use native_tls::{Certificate, Identity, TlsConnector};
use once_cell::sync::Lazy;
use rand::Rng;
use std::sync::Arc;
use std::time::Duration;
use tauri::async_runtime::Mutex;
use tauri::{Emitter, Manager};
use tokio::net::TcpStream;
use tokio::select;
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::protocol::Message;
use tokio_tungstenite::{
    connect_async_tls_with_config, Connector, MaybeTlsStream, WebSocketStream,
};

use super::state::{AppState, ClientOnlineState, ClientStatus, GatewayConf, HeartbeatPayloadState};
use crate::app::error::WsError;
use crate::app::task;
use crate::app::terminal::TerminalInfo;
use crate::config::AppConf;
use crate::events::client::send_online_event;
use crate::events::constants::EVENT_DESKTOP_LIST;
use crate::services::api::{
    get_terminal_config, online_terminal, request_static_file, OnlineTerminalResp,
};

const SOCKETIO_PORT: u16 = 11643;
const SOCKETIO_PATH: &str = "socket.io";
const SOCKETIO_MSG_PREFIX: &str = "42";
const SOCKETIO_PING_MSG: &str = "2";
const SOCKETIO_HEARTBEAT_EVENT: &str = "heartbeat";
const SOCKETIO_PING_INTERVAL_SECS: u64 = 20;
const SOCKETIO_PING_TIMEOUT_SECS: u64 = 30;
const RECONNECT_DELAY_MIN_SECS: u64 = 10;
const RECONNECT_DELAY_MAX_SECS: u64 = 15;
const ALREADY_CONNECTED_CHECK_INTERVAL_SECS: u64 = 5;
const TERMINAL_CONFIG_NAME: &[&str] = &[
    "logo",
    "logoWhite",
    "license",
    "clientIconPng",
    "clientIconIco",
    "companyName",
    "isUpdate",
    "copyright",
    "clientPrefix",
    "timeout",
    "clientTheme",
    "deskToolbar",
    "deskToolbarPosition",
    "loginTypes",
    "companyPhone",
    "companyEmail",
    "gatewayAddrShowSwitch",
    "displayVersion",
    "backgroundImage",
    "terminalRememberPasswordSwitch",
    "publicityImage",
    "floatBall",
    "firstLoginResetPasswordSwitch",
    "oneTimePasswordSwitch",
    "securityPassword",
    "securityPasswordSwitch",
    "smsResetPasswordSwitch",
    "terminalGraphAuthenticationSwitch",
    "terminalLoginErrorTimes",
    "terminalLoginMeteringMinute",
    "terminalMultiFactorAuthenticationSwitch",
    "terminalPasswordRemainingValidity",
    "terminalPasswordValidDays",
    "terminalStrongPasswordSwitch",
    "warnLoginFromDifferentLocationSwitch",
];

type WsWriter = SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>;

#[derive(Debug)]
enum WsCommand {
    Send(Message),
    Close,
}

#[derive(Debug, PartialEq)]
enum KnownWsEvent {
    ListDesktop,
    Unknown,
}

impl From<&str> for KnownWsEvent {
    fn from(s: &str) -> Self {
        match s {
            "listDesktop" => KnownWsEvent::ListDesktop,
            _ => KnownWsEvent::Unknown,
        }
    }
}

static WS_TX: Lazy<Mutex<Option<mpsc::Sender<WsCommand>>>> = Lazy::new(|| Mutex::new(None));

#[tauri::command]
pub async fn reconnect_ws(
    win: tauri::WebviewWindow,
    app_state: tauri::State<'_, AppState>,
) -> Result<(), WsError> {
    info!("Received reconnect request.");
    let online_state_cloned = Arc::clone(&app_state.online_state);
    let reconnect_notifier = {
        let mut state = online_state_cloned.lock().await;
        state.is_online = false;
        Arc::clone(&state.reconnect_notifier)
    };
    send_online_event(&win, false).await;
    reconnect_notifier.notify_one();

    if let Some(tx) = WS_TX.lock().await.take() {
        info!("Sending close command to WebSocket writer task.");
        if let Err(e) = tx.send(WsCommand::Close).await {
            error!("Failed to send close command: {:?}", e);
        }
    } else {
        info!("No active WebSocket connection to close.");
    }
    Ok(())
}

async fn register_and_fetch_config(
    terminal_info_cloned: &Arc<Mutex<TerminalInfo>>,
    gateway_conf_cloned: &Arc<Mutex<GatewayConf>>,
) -> Result<(OnlineTerminalResp, String), WsError> {
    // client request online
    let (online_payload, terminal_id, is_thin) = {
        let terminal_info = terminal_info_cloned.lock().await;
        let mut payload = serde_json::to_value(&*terminal_info)?;
        let app_conf = AppConf::read();

        if let Some(obj) = payload.as_object_mut() {
            obj.insert(
                "integration".to_string(),
                serde_json::json!(app_conf.integration),
            );
            if let Some(gateway) = app_conf.get_current_gateway() {
                obj.insert(
                    "enableProxy".to_string(),
                    serde_json::json!(gateway.is_public),
                );
            }
        }
        (payload, terminal_info.id.clone(), terminal_info.is_thin)
    };

    let data = online_terminal(&online_payload).await?;
    info!("Client online successful. {:?}", &data);

    let resp: OnlineTerminalResp = serde_json::from_value(data.data.clone())?;

    // asynchronous tasks： set-timezone,set-ntp,enable-or-disable-integration
    let resp_clone = resp.clone();
    tauri::async_runtime::spawn(async move {
        if is_thin {
            info!("Thin client mode detected, applying settings...");
            if let Err(e) = task::apply_thin_settings(&resp_clone).await {
                error!("Failed to apply thin client settings: {:?}", e);
            }
        } else if resp_clone.integration {
            info!("Integration mode detected, starting services...");
            if let Err(e) = task::start_integration().await {
                error!("Failed to start integration mode: {:?}", e);
            }
        }
    });

    let client_display_name = resp.terminal_name.clone();
    let mut conf = AppConf::read();
    conf.client_name = client_display_name;
    conf.integration = resp.integration;
    conf.write().expect("Failed to write app config");

    // 每次注册成功缓存网关配置 包括断网重连 新增网关 切换网关
    let res = get_terminal_config(&serde_json::json!({ "names": TERMINAL_CONFIG_NAME })).await?;
    if let Ok(mut cur_gateway_conf) = serde_json::from_value::<GatewayConf>(res.data) {
        request_static_file(&mut cur_gateway_conf).await;
        let mut mut_gateway_conf = gateway_conf_cloned.lock().await;
        *mut_gateway_conf = cur_gateway_conf;
    } else {
        error!("Failed to deserialize terminal config.");
    }

    Ok((resp, terminal_id))
}

// #[tauri::command]
pub async fn start_online(app_state: AppState, win: tauri::WebviewWindow) -> Result<(), WsError> {
    let online_state_cloned = Arc::clone(&app_state.online_state);
    let heartbeat_state_cloned = Arc::clone(&app_state.heartbeat_payload_state);
    let gateway_conf_cloned = Arc::clone(&app_state.gateway_conf);
    let terminal_info_cloned = Arc::clone(&app_state.terminal_info);
    tauri::async_runtime::spawn(async move {
        loop {
            let reconnect_notifier = {
                let state = online_state_cloned.lock().await;
                if state.is_online {
                    error!("Already connected, skipping reconnection attempt.");
                    // Wait for a bit before checking the state again to avoid a tight loop
                    tokio::time::sleep(Duration::from_secs(ALREADY_CONNECTED_CHECK_INTERVAL_SECS))
                        .await;
                    continue;
                }
                state.reconnect_notifier.clone()
            };

            match register_and_fetch_config(&terminal_info_cloned, &gateway_conf_cloned).await {
                Ok((resp, terminal_id)) => {
                    info!("Client registration and config fetch successful.");
                    let heartbeat_interval = resp.heartbeat_interval / 1000;

                    // create websocket connection
                    match connect_to_websocket(
                        &win,
                        &online_state_cloned,
                        &heartbeat_state_cloned,
                        heartbeat_interval,
                        &terminal_id,
                        &resp,
                    )
                    .await
                    {
                        Ok(_) => {
                            info!("Connection closed, attempting to reconnect...");
                        }
                        Err(e) => {
                            error!("Failed to connect: {:?}", e);
                        }
                    }
                }
                Err(e) => {
                    error!(
                        "Client online failed during registration or config fetch: {:?}",
                        e
                    );
                }
            }

            let mut immediate_reconnect = false;
            {
                let mut state = online_state_cloned.lock().await;
                if state.immediate_reconnect {
                    immediate_reconnect = true;
                    state.immediate_reconnect = false;
                }
            }
            if !immediate_reconnect {
                // Generate a random delay between 10 and 15 seconds
                let delay = rand::thread_rng()
                    .gen_range(RECONNECT_DELAY_MIN_SECS..=RECONNECT_DELAY_MAX_SECS);
                info!(
                    "=========== Client online in {} seconds! ===========",
                    delay
                );
                select! {
                    _ = tokio::time::sleep(Duration::from_secs(delay)) => {
                        // Continue loop after delay
                    },
                    _ = reconnect_notifier.notified() => {
                        info!("Reconnect notifier was received, connecting immediately.");
                        // Continue the loop immediately
                    }
                }
            }
        }
    });
    Ok(())
}

fn spawn_writer_task(
    mut rx: mpsc::Receiver<WsCommand>,
    mut writer: WsWriter,
) -> tauri::async_runtime::JoinHandle<()> {
    tauri::async_runtime::spawn(async move {
        while let Some(command) = rx.recv().await {
            match command {
                WsCommand::Send(msg) => {
                    if let Err(e) = writer.send(msg).await {
                        error!("Failed to send message: {:?}", e);
                        break;
                    }
                }
                WsCommand::Close => {
                    info!("Closing WebSocket connection as requested.");
                    if let Err(e) = writer.close().await {
                        error!("Error closing websocket: {:?}", e);
                    }
                    break;
                }
            }
        }
        // Ensure the connection is closed if the loop exits unexpectedly
        let _ = writer.close().await;
        info!("WebSocket writer task finished.");
    })
}

fn spawn_ping_task(tx: mpsc::Sender<WsCommand>) -> tauri::async_runtime::JoinHandle<()> {
    tauri::async_runtime::spawn(async move {
        loop {
            tokio::time::sleep(Duration::from_secs(SOCKETIO_PING_INTERVAL_SECS)).await;
            let msg = Message::Text(SOCKETIO_PING_MSG.to_string());
            if tx.send(WsCommand::Send(msg)).await.is_err() {
                error!("Failed to send ping message to channel, writer task may have stopped.");
                break;
            }
            debug!("Ping message sent to channel.");
        }
    })
}

fn spawn_heartbeat_task(
    tx: mpsc::Sender<WsCommand>,
    heartbeat_payload_state_cloned: Arc<Mutex<HeartbeatPayloadState>>,
    heartbeat_interval_second: u64,
) -> tauri::async_runtime::JoinHandle<()> {
    tauri::async_runtime::spawn(async move {
        loop {
            tokio::time::sleep(Duration::from_secs(heartbeat_interval_second)).await;

            let msg_to_send = {
                let payload = heartbeat_payload_state_cloned.lock().await;
                match serde_json::to_string(&*payload) {
                    Ok(heartbeat_pyd) => {
                        debug!("Prepared heartbeat message: {:?}", heartbeat_pyd);
                        let vec_msg = vec![SOCKETIO_HEARTBEAT_EVENT, &heartbeat_pyd];
                        match serde_json::to_string(&vec_msg) {
                            Ok(json_msg) => Some(format!("{}{}", SOCKETIO_MSG_PREFIX, json_msg)),
                            Err(e) => {
                                error!("Failed to serialize heartbeat vec message: {:?}", e);
                                None
                            }
                        }
                    }
                    Err(e) => {
                        error!("Failed to serialize heartbeat payload: {:?}", e);
                        None
                    }
                }
            };

            if let Some(msg_str) = msg_to_send {
                let msg = Message::Text(msg_str);
                if tx.send(WsCommand::Send(msg)).await.is_err() {
                    error!("Failed to send heartbeat to channel, writer task may have stopped.");
                    break;
                }
            }
        }
    })
}

async fn handle_incoming_messages(
    win: &tauri::WebviewWindow,
    mut read: SplitStream<WebSocketStream<MaybeTlsStream<TcpStream>>>,
) {
    let ping_timeout_duration = Duration::from_secs(SOCKETIO_PING_TIMEOUT_SECS);
    let mut last_pong = std::time::Instant::now();

    while let Ok(Some(msg)) = tokio::time::timeout(ping_timeout_duration, read.next()).await {
        match msg {
            Ok(Message::Text(text)) => {
                debug!("Received message from server: {:?}", text);
                if text.starts_with(SOCKETIO_MSG_PREFIX) {
                    let payload_str = &text[SOCKETIO_MSG_PREFIX.len()..];
                    if let Ok(json_payload) = serde_json::from_str::<serde_json::Value>(payload_str)
                    {
                        if let Some(event_name) = json_payload.get(0).and_then(|v| v.as_str()) {
                            match KnownWsEvent::from(event_name) {
                                KnownWsEvent::ListDesktop => {
                                    info!("Received listDesktop event from server.");
                                    if let Err(e) = win.emit(EVENT_DESKTOP_LIST, ()) {
                                        error!("Failed to emit desktop-list event: {}", e);
                                    }
                                }
                                KnownWsEvent::Unknown => {
                                    warn!("Received unknown event: {}", event_name);
                                }
                            }
                        }
                    }
                }
            }
            Ok(Message::Binary(bin)) => info!("Received binary data: {:?}", bin),
            Ok(Message::Pong(_)) => {
                last_pong = std::time::Instant::now();
            }
            Ok(Message::Close(_)) => {
                error!("Connection closed by server");
                break;
            }
            Err(e) => {
                error!("Error reading message: {:?}", e);
                break;
            }
            _ => {}
        }
    }

    if last_pong.elapsed() >= ping_timeout_duration {
        error!("Pong timeout, connection might be lost");
    }
}

pub async fn connect_to_websocket(
    win: &tauri::WebviewWindow,
    online_state: &Arc<Mutex<ClientOnlineState>>,
    heartbeat_payload_state: &Arc<Mutex<HeartbeatPayloadState>>,
    heartbeat_interval_second: u64,
    terminal_id: &str,
    online_resp: &OnlineTerminalResp,
) -> Result<(), WsError> {
    info!("Start connect to websocket server!");
    let current_gateway_info = AppConf::read()
        .get_current_gateway()
        .ok_or_else(|| WsError::GatewayNotConfigured)?;

    let (address, port) = if current_gateway_info.is_public {
        online_resp
            .proxy
            .as_ref()
            .and_then(|p| p.ip.as_ref().zip(p.socket_port))
            .map(|(ip, port)| {
                info!("Using proxy for public gateway: {}:{}", ip, port);
                (ip.clone(), port)
            })
            .unwrap_or_else(|| {
                info!("Public gateway but no proxy, using gateway address");
                (current_gateway_info.address.clone(), SOCKETIO_PORT)
            })
    } else {
        (current_gateway_info.address.clone(), SOCKETIO_PORT)
    };

    let connect_addr = format!(
        "wss://{}:{}/{}/?EIO=3&transport=websocket&terminalID={}",
        address, port, SOCKETIO_PATH, terminal_id
    );

    let url = url::Url::parse(&connect_addr)?;

    // Embed certificate files directly into the binary at compile time
    const ROOT_CERT_BYTES: &[u8] = include_bytes!("../../resources/root.crt");
    const CLIENT_CERT_BYTES: &[u8] = include_bytes!("../../resources/client.crt");
    const CLIENT_KEY_BYTES: &[u8] = include_bytes!("../../resources/client.key");

    // Load root certificate from memory
    let ca_cert = Certificate::from_pem(ROOT_CERT_BYTES)
        .map_err(|e| WsError::Tls(format!("Failed to parse root certificate from PEM: {}", e)))?;

    // Load client certificate and key from memory
    let identity = Identity::from_pkcs8(CLIENT_CERT_BYTES, CLIENT_KEY_BYTES)
        .map_err(|e| WsError::Tls(format!("Failed to parse client certificate: {}", e)))?;

    // 创建 TLS 连接器
    let tls_connector = TlsConnector::builder()
        .danger_accept_invalid_certs(false)
        .identity(identity)
        .add_root_certificate(ca_cert)
        .danger_accept_invalid_hostnames(true)
        .build()
        .expect("Failed to create TLS connector");

    let tls_conn = Connector::NativeTls(tls_connector);

    let (ws_stream, _) = connect_async_tls_with_config(url, None, false, Some(tls_conn)).await?;

    info!("WebSocket connected!");

    // Determine the SPICE proxy URL based on gateway type and proxy info.
    let spice_proxy_url = if current_gateway_info.is_public {
        online_resp
            .proxy
            .as_ref()
            .and_then(|p| p.ip.as_ref().zip(p.spice_port))
            .map(|(ip, port)| format!("http://{}:{}", ip, port))
    } else {
        None
    };

    // Set or clear the SPICE_PROXY environment variable.
    if let Some(url) = spice_proxy_url {
        std::env::set_var("SPICE_PROXY", &url);
        info!("Set SPICE_PROXY to {}", url);
    } else {
        info!("Clearing SPICE_PROXY (not applicable or info incomplete).");
        std::env::remove_var("SPICE_PROXY");
    }

    // Update state and notify front-end that the websocket is connected
    {
        let mut online_state = online_state.lock().await;
        online_state.is_online = true;
        online_state.immediate_reconnect = false; // Reset the flag

        let mut heartbeat_state = heartbeat_payload_state.lock().await;
        heartbeat_state.status = ClientStatus::Online.to_string();

        send_online_event(win, true).await;
    }

    // --- Trigger Auto-Update Check ---
    // Spawn the check in a new task to avoid blocking the WebSocket connection flow.
    let app_handle = win.app_handle().clone();
    tokio::spawn(async move {
        // A small delay can improve UX, preventing the app from connecting and immediately restarting.
        tokio::time::sleep(Duration::from_secs(5)).await;
        crate::app::updater::app_updates::trigger_auto_update(&app_handle).await;
    });

    let (writer, reader) = ws_stream.split();

    // Create a channel for WebSocket commands
    let (tx, rx) = mpsc::channel::<WsCommand>(10); // Channel with a buffer of 10 messages

    // Store the sender half of the channel in the global static
    *WS_TX.lock().await = Some(tx.clone());

    // Spawn tasks
    let writer_task = spawn_writer_task(rx, writer);
    let ping_task = spawn_ping_task(tx.clone());
    let heartbeat_task = spawn_heartbeat_task(
        tx,
        Arc::clone(heartbeat_payload_state),
        heartbeat_interval_second,
    );

    // Run the message reader loop. This will block until the connection is closed.
    handle_incoming_messages(win, reader).await;

    // The reader has finished, which means the connection is down. Abort all related tasks.
    ping_task.abort();
    heartbeat_task.abort();
    writer_task.abort();

    error!("WebSocket disconnected!");
    {
        // Clear the sender from the global static
        *WS_TX.lock().await = None;
        let mut state = online_state.lock().await;
        state.is_online = false;
        send_online_event(win, false).await;

        // Clear the SPICE_PROXY environment variable on disconnect.
        info!("Clearing SPICE_PROXY on disconnect.");
        std::env::remove_var("SPICE_PROXY");
    }

    Ok(())
}
