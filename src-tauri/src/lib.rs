mod app;
mod config;
pub mod core;
mod events;
mod plugins;
mod services;
mod utils;

use crate::app::updater::app_updates;
use crate::core::handle;
use app::{auth, cmd, setup, terminal, ws};
use services::{desktop, shell, vapp};
use tauri::{Manager, UserAttentionType, WindowEvent};
use tauri_plugin_autostart::MacosLauncher;
use tracing::{error, info};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
    }

    // NOTE: Logging is initialized inside the setup hook to access app paths and configuration.

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(main_window) = app.get_webview_window("main") {
                if let Err(e) = main_window.unminimize() {
                    error!("failed to un-minimize: {}", e);
                }

                if let Err(e) = main_window.set_focus() {
                    error!("failed to set focus: {}", e);
                }

                if let Err(e) =
                    main_window.request_user_attention(Some(UserAttentionType::Informational))
                {
                    error!("failed to request user: {}", e);
                }
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(plugins::awesome::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--from-autostart", "--hey"]),
        ))
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { .. } = event {
                if window.label() == "main" {
                    info!("Main window close requested. Cleaning up child processes.");
                    // Spawn tasks to kill both hdp-viewer and the activity monitor
                    tauri::async_runtime::spawn(shell::kill_all_hdp_viewers());
                    tauri::async_runtime::spawn(shell::kill_all_hdp_vapp());
                    tauri::async_runtime::spawn(shell::kill_all_input_activity_monitors());
                }
            }
        })
        .setup(|app| {
            handle::Handle::global().init(app.app_handle());

            // Initialize the logging system from our dedicated module.
            // The guard is managed by Tauri to ensure logs are flushed on exit.
            let guard = utils::log_setup::init_logging(app.handle())?;
            app.manage(guard);

            tauri::async_runtime::block_on(setup::init(app))?;
            Ok(())
        })
        // This is where you pass in your commands
        .invoke_handler(tauri::generate_handler![
            #[cfg(desktop)]
            app_updates::fetch_update,
            #[cfg(desktop)]
            app_updates::install_update,
            cmd::diagnose_gateway_network,
            cmd::close_splashscreen,
            cmd::open_docs,
            cmd::open_network_settings,
            cmd::login,
            cmd::logout,
            cmd::get_client_online_status,
            cmd::get_local_net_info,
            cmd::shutdown_local_device,
            config::cmd::get_app_conf,
            config::cmd::get_log_info,
            config::cmd::clean_log_file,
            config::cmd::open_log_directory,
            config::cmd::get_gateway_server,
            config::cmd::add_gateway_server,
            config::cmd::delete_gateway_server,
            config::cmd::update_gateway_server,
            config::cmd::switch_gateway_server,
            config::cmd::set_theme,
            config::cmd::set_language,
            config::cmd::set_autostart,
            config::cmd::set_autoupdate,
            config::cmd::set_fullscreen,
            config::cmd::set_developer_mode,
            config::cmd::set_integration,
            config::cmd::set_log,
            terminal::cmd::get_client_about,
            terminal::cmd::get_client_config,
            terminal::cmd::get_terminal_info,
            terminal::cmd::check_version_upgrade,
            desktop::connect_desktop,
            shell::list_usb_devices,
            shell::kill_all_hdp_viewers,
            shell::kill_all_hdp_vapp,
            shell::kill_all_input_activity_monitors,
            vapp::connect_vapp,
            ws::reconnect_ws,
            auth::save_auth_token,
            auth::get_auth_token,
            auth::clear_auth_token,
        ]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running client application");
}
