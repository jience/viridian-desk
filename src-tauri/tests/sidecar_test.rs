#![cfg(feature = "test-harness")]

use app_lib::core::{
    handle::Handle,
    sidecar::{
        get_net_probe_from_sidecar, get_terminal_model_from_sidecar, get_uuid_from_sidecar,
        ClientDeviceType,
    },
};
use std::time::Duration;

#[tauri::test]
async fn test_get_uuid_from_sidecar() {
    // In Tauri v2, the `#[tauri::test]` macro runs the app defined in `tauri.conf.json`.
    // The app's own `setup` function will run and initialize the global handle.
    // We just need to wait for it to be available.
    let mut app_handle = None;
    for _ in 0..10 {
        if let Some(handle) = Handle::global().app_handle() {
            app_handle = Some(handle);
            break;
        }
        tokio::time::sleep(Duration::from_millis(500)).await;
    }

    let app_handle = app_handle.expect("App handle was not initialized in time for the test");

    // Call the async function we want to test.
    let result = get_uuid_from_sidecar(&app_handle).await;

    // Assert the results.
    assert!(
        result.is_ok(),
        "get_uuid_from_sidecar should return Ok. Error: {:?}",
        result.err()
    );

    let uuid = result.unwrap();
    assert!(!uuid.is_empty(), "The returned UUID should not be empty");

    // A simple check for UUID format.
    assert!(
        uuid.len() > 30,
        "The UUID should be a long string (typically 32-36 chars)"
    );
}

#[tauri::test]
async fn test_get_terminal_model_from_sidecar() {
    // Wait for the app handle to be available
    let mut app_handle = None;
    for _ in 0..10 {
        if let Some(handle) = Handle::global().app_handle() {
            app_handle = Some(handle);
            break;
        }
        tokio::time::sleep(Duration::from_millis(500)).await;
    }
    let app_handle = app_handle.expect("App handle was not initialized in time for the test");

    // Call the function to test
    let result = get_terminal_model_from_sidecar(&app_handle).await;

    // Assert the results
    assert!(
        result.is_ok(),
        "get_terminal_model_from_sidecar should return Ok. Error: {:?}",
        result.err()
    );

    let model = result.unwrap();
    assert!(
        model.client_device_type == ClientDeviceType::Sc
            || model.client_device_type == ClientDeviceType::Tc,
        "client_device_type should be Sc or Tc"
    );
    assert!(
        !model.client_type.is_empty(),
        "client_type should not be empty"
    );
    assert!(!model.client_os.is_empty(), "client_os should not be empty");
    assert!(
        !model.client_os_version.is_empty(),
        "client_os_version should not be empty"
    );
}

#[tauri::test]
async fn test_get_net_probe_from_sidecar() {
    // Wait for the app handle to be available
    let mut app_handle = None;
    for _ in 0..10 {
        if let Some(handle) = Handle::global().app_handle() {
            app_handle = Some(handle);
            break;
        }
        tokio::time::sleep(Duration::from_millis(500)).await;
    }
    let app_handle = app_handle.expect("App handle was not initialized in time for the test");

    // Call the function to test
    let result = get_net_probe_from_sidecar(&app_handle).await;

    // Assert the results
    assert!(
        result.is_ok(),
        "get_net_probe_from_sidecar should return Ok. Error: {:?}",
        result.err()
    );

    let net_probes = result.unwrap();
    assert!(
        !net_probes.is_empty(),
        "The returned net_probes should not be empty"
    );
}
