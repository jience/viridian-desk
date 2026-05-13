//! `tracing` subscriber initialization.

use crate::{config, plugins};
use crate::utils::{dirs, help};
use anyhow::Result;
use chrono::Local;
use once_cell::sync::OnceCell;
use std::str::FromStr;
use tauri::{AppHandle, Manager};
use tracing::debug;
use tracing_rolling_file::{RollingConditionBase, RollingFileAppender};
use tracing_subscriber::prelude::*;
use tracing_subscriber::{fmt, filter, reload, Registry};
use tracing_subscriber::fmt::time::FormatTime;
use tracing_subscriber::fmt::format::Writer;

pub static TRACING_FILTER_RELOAD_HANDLE: OnceCell<reload::Handle<filter::LevelFilter, Registry>> =
    OnceCell::new();

struct LocalTimer;

impl FormatTime for LocalTimer {
    fn format_time(&self, w: &mut Writer<'_>) -> std::fmt::Result {
        let now = Local::now().format("%Y-%m-%d %H:%M:%S");
        write!(w, "{}", now)
    }
}

/// Initializes the `tracing` subscriber with multiple layers.
///
/// This sets up:
/// 1.  A file appender for JSON-formatted logs, with daily rotation.
/// 2.  A stdout logger for simple, human-readable logs.
/// 3.  A custom writer that sends logs to the Tauri webview.
/// 4.  An environment filter to control log levels, read from `AppConf`.
///
/// The `WorkerGuard` returned by this function must be kept alive for the
/// entirety of the application's lifecycle to ensure logs are flushed.
pub fn init_logging(
    app: &AppHandle,
) -> Result<tracing_appender::non_blocking::WorkerGuard, Box<dyn std::error::Error>> {
    // Manual load config for logging setup before the main state is initialized.
    let config_path = app
        .path()
        .config_dir()?
        .join(dirs::APP_ID)
        .join(dirs::APP_CONFIG);

    let app_conf = if config_path.exists() {
        help::read_json::<config::AppConf>(&config_path).unwrap_or_else(|e| {
            // Log the error if parsing fails on an existing file
            tracing::error!(
                "Failed to read or parse config file at {}, using defaults: {}",
                config_path.display(),
                e
            );
            config::AppConf::default()
        })
    } else {
        // File doesn't exist, use defaults. This is not an error.
        config::AppConf::default()
    };

    // Configure logging level from a config file
    let log_level = app_conf.log.level.to_string();
    let filter = filter::LevelFilter::from_str(&log_level)?;
    let (filter, reload_handle) = reload::Layer::new(filter);

    // Configure file logger with rotation and retention
    let log_path = app_conf.log.path.clone();
    // Ensure the parent directory exists
    if let Some(parent_dir) = log_path.parent() {
        std::fs::create_dir_all(parent_dir)?;
    }
    let condition = RollingConditionBase::new()
        .max_size(app_conf.log.max_file_size)
        .daily();
    let file_appender = RollingFileAppender::new(
        log_path,
        condition,
        app_conf.log.log_retention_files,
    )?;
    let (non_blocking_file, guard) = file_appender.get_non_blocking_appender();

    // Configure webview logger
    let app_handle_clone = app.clone();
    let webview_layer = fmt::layer()
        .with_writer(move || plugins::log::TauriWriter::new(&app_handle_clone))
        .with_ansi(false) // Disable ANSI colors for webview
        .with_target(false) // Don't include module paths
        .with_level(true)
        .json();

    // Configure console logger
    let console_layer = fmt::layer()
        .with_writer(std::io::stdout)
        .with_timer(LocalTimer);

    // Configure file logger
    let file_layer = fmt::layer()
        .with_writer(non_blocking_file)
        .with_ansi(false)
        // .json()
        .with_timer(LocalTimer);

    // Combine all layers
    tracing_subscriber::registry()
        .with(filter)
        .with(file_layer) // File logger
        .with(console_layer) // Console logger
        .with(webview_layer) // Webview logger (JSON)
        .init();
    TRACING_FILTER_RELOAD_HANDLE
        .set(reload_handle)
        .map_err(|_| anyhow::anyhow!("Could not set reload_handle"))?;

    Ok(guard)
}


pub async fn set_log_level(level: String) -> std::result::Result<(), String> {
    debug!("set app log level: {}", level);

    let lev_filter =
        filter::LevelFilter::from_str(&level).map_err(|e| e.to_string())?;

    if let Some(handle) = TRACING_FILTER_RELOAD_HANDLE.get() {
        if let Err(e) = handle.modify(|filter| *filter = lev_filter) {
            return Err(format!("Failed to set log filter: {}", e));
        }
    } else {
        return Err("Failed to get TRACING_FILTER_RELOAD_HANDLE".to_string());
    }
    Ok(())
}
