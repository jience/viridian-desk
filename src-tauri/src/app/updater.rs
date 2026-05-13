#[cfg(desktop)]
pub mod app_updates {
    use crate::app::state::AppState;
    use serde::Serialize;
    use std::sync::Mutex;
    use tauri::{ipc::Channel, AppHandle, Manager, State};
    use tauri_plugin_updater::{Update, UpdaterExt};
    use tracing::{debug, info, error};

    #[derive(Debug, thiserror::Error)]
    pub enum Error {
        #[error(transparent)]
        Updater(#[from] tauri_plugin_updater::Error),
        #[error("there is no pending update")]
        NoPendingUpdate,
        #[error("no gateway found")]
        NoGateway,
    }

    impl Serialize for Error {
        fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
        where
            S: serde::Serializer,
        {
            serializer.serialize_str(self.to_string().as_str())
        }
    }

    type Result<T> = std::result::Result<T, Error>;

    #[derive(Clone, Serialize)]
    #[serde(tag = "event", content = "data")]
    pub enum DownloadEvent {
        #[serde(rename_all = "camelCase")]
        Started {
            content_length: Option<u64>,
        },
        #[serde(rename_all = "camelCase")]
        Progress {
            chunk_length: usize,
            downloaded_length: usize,
        },
        Finished,
    }

    #[derive(Serialize)]
    #[serde(rename_all = "camelCase")]
    pub struct UpdateMetadata {
        version: String,
        current_version: String,
        notes: Option<String>,
    }

    #[tauri::command]
    pub async fn fetch_update(
        app: AppHandle,
        pending_update: State<'_, PendingUpdate>,
    ) -> Result<Option<UpdateMetadata>> {
        let app_state = app.state::<AppState>();
        let app_conf = app_state.app_conf.lock().await;
        let terminal_info = app_state.terminal_info.lock().await;

        let gateway = app_conf.get_current_gateway().ok_or(Error::NoGateway)?;
        let platform_code = &terminal_info.platform_code;

        let url = url::Url::parse(&format!(
            "https://{}:{}/checkUpdate?platformCode={}&arch={{{{arch}}}}",
            gateway.address, gateway.port, platform_code
        ))
        .expect("invalid URL");
        info!("Updater fetch URL: {}", url.as_str());

        let update = app
            .updater_builder()
            .configure_client(|client_builder| client_builder.danger_accept_invalid_certs(true))
            .version_comparator(|current, update| {
                // default comparison: `update.version > version`
                update.version != current
            })
            .on_before_exit(|| info!("app is about to exit on Windows!"))
            .endpoints(vec![url])?
            .build()?
            .check()
            .await?;

        let update_metadata = update.as_ref().map(|update| UpdateMetadata {
            version: update.version.clone(),
            current_version: update.current_version.clone(),
            notes: update.body.clone(),
        });

        *pending_update.0.lock().unwrap() = update;

        Ok(update_metadata)
    }

    #[tauri::command]
    pub async fn install_update(
        app: AppHandle,
        pending_update: State<'_, PendingUpdate>,
        on_event: Channel<DownloadEvent>,
    ) -> Result<()> {
        info!("======== Starting download and update ========");
        let Some(update) = pending_update.0.lock().unwrap().take() else {
            return Err(Error::NoPendingUpdate);
        };

        let mut started = false;
        let mut downloaded_length = 0;

        update
            .download_and_install(
                |chunk_length, content_length| {
                    if !started {
                        let _ = on_event.send(DownloadEvent::Started { content_length });
                        started = true;
                        info!("======== Starting download ========");
                    }

                    downloaded_length += chunk_length;
                    let _ = on_event.send(DownloadEvent::Progress {
                        chunk_length,
                        downloaded_length,
                    });
                    debug!(
                        "======== Downloaded {downloaded_length} from {content_length:?} ========"
                    );
                },
                || {
                    let _ = on_event.send(DownloadEvent::Finished);
                    info!("======== Download finished ========");
                },
            )
            .await?;

        info!("======== Update finished ========");
        app.restart();
        // Ok(())
    }

    pub(crate) struct PendingUpdate(pub Mutex<Option<Update>>);

    /// Triggers the auto-update process if enabled in the configuration.
    pub async fn trigger_auto_update(app_handle: &AppHandle) {
        info!("Checking for auto-update eligibility...");
        let app_state = app_handle.state::<AppState>();
        let should_auto_update = app_state.app_conf.lock().await.auto_update;

        if !should_auto_update {
            debug!("Auto-update is disabled. Skipping check.");
            return;
        }

        info!("Auto-update is enabled. Fetching update information...");
        let pending_update_state_for_fetch = app_handle.state::<PendingUpdate>();

        // Clone the handle reference to get an owned handle for `fetch_update`.
        match fetch_update(app_handle.clone(), pending_update_state_for_fetch).await {
            Ok(Some(metadata)) => {
                info!(
                    "Auto-update found: version {}. Current: {}. Installing...",
                    metadata.version, metadata.current_version
                );

                // Clone the handle reference again to get an owned, 'static handle for the spawned task.
                let handle_for_install = app_handle.clone();

                tokio::spawn(async move {
                    // Get the state inside the task from the owned handle.
                    let pending_update_state = handle_for_install.state::<PendingUpdate>();

                    let Some(update) = pending_update_state.0.lock().unwrap().take() else {
                        error!("Update was available but could not be retrieved from state.");
                        return;
                    };

                    info!("======== Starting silent auto-update download ========");
                    if let Err(e) = update.download_and_install(
                        |chunk_length,content_length| {
                            debug!("Auto-update downloading chunk: {} bytes, total: {:?}", 
                                chunk_length, content_length);
                        }, 
                        || {
                            info!("======== Auto-update download finished ========");
                        }
                    ).await {
                        error!("Failed to install auto-update: {}", e);
                    } else {
                        info!("======== Auto-update finished, restarting app ========");
                        handle_for_install.restart();
                    }
                });
            }
            Ok(None) => {
                info!("No auto-updates available.");
            }
            Err(e) => {
                error!("Failed to fetch auto-update information: {}", e);
            }
        }
    }
}
