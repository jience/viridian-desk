use serde::{Deserialize, Serialize};
use keytar;

const SERVICE_NAME: &str = "com.desk.client.authtoken";

#[derive(Serialize, Deserialize)]
pub struct AuthCredential {
    pub username: String,
    pub token: String,
}

#[tauri::command]
pub async fn save_auth_token(username: String, token: String) -> Result<(), String> {
    keytar::set_password(SERVICE_NAME, &username, &token)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_auth_token(username: String) -> Result<Option<AuthCredential>, String> {
    match keytar::get_password(SERVICE_NAME, &username) {
        Ok(cred) => {
            Ok(Some(AuthCredential {
                username: username.clone(),
                token: cred.password,
            }))
        }
        Err(_) => {
            // If any error occurs (e.g., NoEntry, OS error, etc.),
            // we treat it as if no token was found.
            Ok(None)
        }
    }
}

#[tauri::command]
pub async fn clear_auth_token(username: String) -> Result<(), String> {
    keytar::delete_password(SERVICE_NAME, &username)
        .map_err(|e| e.to_string())?;
    Ok(())
}
