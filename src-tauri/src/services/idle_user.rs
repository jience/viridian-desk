use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;
use tokio::sync::broadcast;
use tokio::task;
use tokio::time::{self, Duration};
use tokio_util::sync::CancellationToken;
use tracing::{debug, info};

use crate::events::constants::{
    EVENT_DESKTOP_IDLE_CLOSE, EVENT_DESKTOP_IDLE_DISCONNECT, EVENT_USER_IDLE_LOGOUT,
};

const INPUT_ACTIVITY_MONITOR_SIDECAR: &str = "input-activity-monitor";

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum DesktopIdleAction {
    Disconnect,
    Close,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct UserPolicy {
    pub session: Option<UserSessionPolicy>, // User Idle Policy
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct UserSessionPolicy {
    #[serde(rename = "userIdleTime")]
    pub user_idle_time: Option<String>,
    #[serde(rename = "DesktopIdleTimeAction")]
    pub desktop_idle_time_action: Option<DesktopIdleAction>,
    #[serde(rename = "DesktopIdleTimeContent")]
    pub desktop_idle_time_content: Option<String>,
}

impl UserSessionPolicy {
    /// Checks if any idle policies are actually configured and active (time > 0).
    fn has_active_policies(&self) -> bool {
        let user_idle_active = self
            .user_idle_time
            .as_ref()
            .and_then(|s| s.parse::<u64>().ok())
            .map_or(false, |t| t > 0);

        let desktop_idle_active = self.desktop_idle_time_action.is_some()
            && self
                .desktop_idle_time_content
                .as_ref()
                .and_then(|s| s.parse::<u64>().ok())
                .map_or(false, |t| t > 0);

        user_idle_active || desktop_idle_active
    }
}

pub fn start(app_handle: AppHandle, session_policy: &UserSessionPolicy) -> CancellationToken {
    let token = CancellationToken::new();

    // If no policies are active, don't start any timers or the monitor.
    if !session_policy.has_active_policies() {
        info!("[IdleUserService] No active idle policies. Monitor will not be started.");
        return token;
    }

    let (tx, _) = broadcast::channel(16);

    // --- User Idle Logout Timer ---
    if let Some(idle_time_str) = session_policy.user_idle_time.as_ref() {
        if let Ok(idle_time) = idle_time_str.parse::<u64>() {
            if idle_time > 0 {
                info!(
                    "[IdleUserService] User idle logout time is set to {} minutes",
                    idle_time
                );
                let mut rx = tx.subscribe();
                let app_handle_clone = app_handle.clone();
                let child_token = token.clone();
                task::spawn(async move {
                    loop {
                        tokio::select! {
                            _ = child_token.cancelled() => {
                                info!("[IdleUserService] Logout timer cancelled.");
                                break;
                            }
                            res = time::timeout(Duration::from_secs(idle_time * 60), rx.recv()) => {
                                match res {
                                    Ok(Ok(_)) => { /* Activity detected, continue loop */ }
                                    Ok(Err(_)) => {
                                        info!("[IdleUserService] Activity channel closed, stopping logout timer.");
                                        break;
                                    }
                                    Err(_) => {
                                        info!("[IdleUserService] User idle timeout reached. Emitting user_idle_logout.");
                                        app_handle_clone.emit(EVENT_USER_IDLE_LOGOUT, ()).unwrap();
                                        break;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
    }

    // --- Desktop Idle Action Timer ---
    if let (Some(action), Some(timeout_str)) = (
        session_policy.desktop_idle_time_action.as_ref(),
        session_policy.desktop_idle_time_content.as_ref(),
    ) {
        if let Ok(idle_time) = timeout_str.parse::<u64>() {
            if idle_time > 0 {
                info!(
                    "[IdleUserService] Desktop idle action time is set to {} minutes",
                    idle_time
                );
                let mut rx = tx.subscribe();
                let action = action.clone();
                let app_handle_clone = app_handle.clone();
                let child_token = token.clone();
                task::spawn(async move {
                    loop {
                        tokio::select! {
                            _ = child_token.cancelled() => {
                                info!("[IdleUserService] Desktop action timer cancelled.");
                                break;
                            }
                            res = time::timeout(Duration::from_secs(idle_time * 60), rx.recv()) => {
                                match res {
                                    Ok(Ok(_)) => { /* Activity detected, continue loop */ }
                                    Ok(Err(_)) => {
                                        info!("[IdleUserService] Activity channel closed, stopping desktop action timer.");
                                        break;
                                    }
                                    Err(_) => {
                                        info!("[IdleUserService] Desktop idle timeout reached. Performing action: {:?}", &action);
                                        match action {
                                            DesktopIdleAction::Disconnect => {
                                                app_handle_clone.emit(EVENT_DESKTOP_IDLE_DISCONNECT, ()).unwrap();
                                            }
                                            DesktopIdleAction::Close => {
                                                info!("[IdleUserService] Emitting desktop_idle_stop.");
                                                app_handle_clone.emit(EVENT_DESKTOP_IDLE_CLOSE, ()).unwrap();
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
    }

    // --- Activity Monitor (Producer) ---
    let tx_clone = tx.clone();
    let child_token = token.clone();
    let app_handle_clone = app_handle.clone(); // Clone app_handle for the task
    task::spawn(async move {
        info!(
            "[IdleUserService] Starting monitor: {}",
            INPUT_ACTIVITY_MONITOR_SIDECAR
        );

        let sidecar_command = app_handle_clone
            .shell()
            .sidecar(INPUT_ACTIVITY_MONITOR_SIDECAR)
            .unwrap();
        let (mut rx, child) = match sidecar_command.spawn() {
            Ok(sidecar) => sidecar,
            Err(e) => {
                info!(
                    "[IdleUserService] Failed to spawn monitor: {}. Idle detection will not work.",
                    e
                );
                return;
            }
        };

        loop {
            tokio::select! {
                _ = child_token.cancelled() => {
                    info!("[IdleUserService] Monitor task cancelled.");
                    break;
                }
                Some(event) = rx.recv() => {
                    match event {
                        CommandEvent::Stdout(_) => {
                            debug!("[IdleUserService] User activity detected, broadcasting.");
                            if tx_clone.send(()).is_err() {
                                info!("[IdleUserService] Activity channel closed, stopping monitor.");
                                break; // Exit loop if a channel is closed
                            }
                        }
                        CommandEvent::Stderr(line) => {
                            info!("[IdleUserService] Monitor stderr: {}", String::from_utf8_lossy(&line));
                        }
                        CommandEvent::Terminated(payload) => {
                            info!("[IdleUserService] Monitor process terminated: {:?}", payload);
                            break; // Exit loop as process has ended
                        }
                        CommandEvent::Error(e) => {
                            info!("[IdleUserService] Error from monitor process: {}", e);
                            break; // Exit loop on error
                        }
                        _ => {} // Ignore other events like `Api`
                    }
                }
            }
        }

        info!("[IdleUserService] Shutting down monitor process.");
        if let Err(e) = child.kill() {
            info!("[IdleUserService] Failed to kill monitor process: {}", e);
        }
    });

    token
}
