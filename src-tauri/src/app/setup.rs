use super::state::AppState;
use crate::app::ws::start_online;
use crate::utils::init;
use once_cell::sync::OnceCell;
use std::sync::Mutex;
use tauri::{App, Manager};
use tauri_plugin_autostart::ManagerExt;
use tracing::{error, info};

pub static VERSION: OnceCell<String> = OnceCell::new();

pub async fn init(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    info!("client application setup");

    #[cfg(desktop)]
    {
        app.handle()
            .plugin(tauri_plugin_updater::Builder::new().build())
            .expect("Failed to build updater plugin");
        app.manage(crate::app::updater::app_updates::PendingUpdate(Mutex::new(
            None,
        )));
    }

    let version = app.package_info().version.to_string();

    VERSION.get_or_init(|| version.clone());

    let _ = init::init_config();

    // Initialize the AppState. This also loads the AppConf from disk.
    let app_state = AppState::new(app.handle()).await;
    // Place the state under Tauri's management.
    app.manage(app_state.clone());

    let app_handle = app.app_handle();
    let app_state_clone_for_spawn = app_state.clone();
    let app_handle_clone_for_spawn = app_handle.clone();

    tauri::async_runtime::spawn(async move {
        let app_conf_lock = app_state_clone_for_spawn.app_conf.lock().await;

        // enable or disable autostart app
        let autostart_mgr = app_handle_clone_for_spawn.autolaunch();
        if app_conf_lock.auto_start {
            let _ = autostart_mgr.enable();
        } else {
            let _ = autostart_mgr.disable();
        }
        if let Ok(is_enabled) = autostart_mgr.is_enabled() {
            info!("registered for autostart? {}", is_enabled);
        } else {
            error!("Failed to check autostart status.");
        }

        // set fullscreen and other main window operations
        if let Some(main_window) = app_handle_clone_for_spawn.get_webview_window("main") {
            if let Err(e) = main_window.set_fullscreen(app_conf_lock.full_screen) {
                error!("Failed to set fullscreen: {}", e);
            }
            if let Err(e) = main_window.set_focus() {
                error!("Failed to set focus: {}", e);
            }

            #[cfg(feature = "thin_client")]
            {
                main_window.set_maximizable(true);
            }

            #[cfg(debug_assertions)]
            {
                main_window.open_devtools();
            }

            let auto_update = app_conf_lock.get_auto_update();
            drop(app_conf_lock); // Release the lock as soon as it's no longer necessary
            if auto_update {
                info!("run check update");
            }

            // Clone the necessary parts for the async task
            let main_window_clone = main_window.clone();
            let app_state_for_ws_task = app_state_clone_for_spawn.clone(); // Clone for the inner WS task

            // Initialize socket.io in a new task so the app doesn't freeze
            tauri::async_runtime::spawn(async move {
                info!("app setup async runtime start");
                if let Err(e) = start_online(app_state_for_ws_task, main_window_clone).await {
                    error!("Failed to start online service: {}", e);
                }
                info!("app setup async runtime end");
            });
        } else {
            error!("Main window not found during async setup operations.");
        }
    });

    Ok(())
}
