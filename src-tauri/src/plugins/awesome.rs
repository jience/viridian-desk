use tauri::{
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, Runtime, State,
};

#[derive(Default)]
struct MyState {}

#[tauri::command]
// this will be accessible with `invoke ('plugin: awesome|do_something')`.
fn do_something<R: Runtime>(_app: AppHandle<R>, _state: State<'_, MyState>) {
    // you can access `MyState` here!
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("awesome")
        .invoke_handler(tauri::generate_handler![do_something])
        .setup(|app_handle, _| {
            // setup plugin specific state here
            app_handle.manage(MyState::default());
            Ok(())
        })
        .build()
}
