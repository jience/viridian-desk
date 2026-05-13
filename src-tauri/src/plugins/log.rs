use std::io;
use tauri::{AppHandle, Emitter};


#[derive(Clone)]
pub struct TauriWriter {
    app_handle: AppHandle,
}

impl TauriWriter {
    pub fn new(app_handle: &AppHandle) -> Self {
        Self {
            app_handle: app_handle.clone(),
        }
    }
}

impl io::Write for TauriWriter {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        let msg = String::from_utf8_lossy(buf).to_string();
        // Use a specific event name for logs
        self.app_handle.emit("rs-log", msg).unwrap();
        Ok(buf.len())
    }

    fn flush(&mut self) -> io::Result<()> {
        // No-op, as emit_all sends immediately
        Ok(())
    }
}