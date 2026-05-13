use super::types::{ConnectError, DesktopInfo, DesktopSpiceInfo};
use crate::app::state::{LoginType, UserInfo};
use crate::config::client::AppConf;
use crate::utils::network::get_local_ip_address;
use crate::utils::tools::{aes128_ecb_decrypt, aes256_cbc_encrypt, rsa_decrypt};
use chrono::{Datelike, Local, Timelike, Weekday};
use ipnetwork::IpNetwork;
use serde::{Deserialize, Serialize};
use std::net::IpAddr;
use std::str::FromStr;
use strum::{Display, EnumString};
use tracing::{debug, info, warn};

/// Note: This struct is now public so it can be used in other modules.
#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TerminalPolicy {
    water_mark: Option<WaterMark>,
    access_limit: Option<AccessLimit>,
    // app_rule: Option<String>, // Helper to handle
    // user_redirect: Option<String>, // Helper to handle
    // desktop_screensaver: Option<String>, // Helper to handle
    desktop_safe: Option<DesktopSafePolicy>,
    // desktop_connection: Option<String>, // todo: Local to handle
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "PascalCase")]
struct WaterMark {
    other_content: Option<WaterMarkOtherContent>,
    watermark_content: Option<String>,
    display_type: Option<String>,
    // display_effect: Option<String>,
    content_colour: Option<String>,
    font_spacing: Option<String>,
    font_size: Option<String>,
    water_mark_spacing: Option<String>,
    inclination: Option<String>,
    water_mark_transparency: Option<String>,
}

impl WaterMark {
    /// Checks if the watermark configuration is effectively empty.
    /// This is true if it was deserialized from an empty object `{}`.
    fn is_effectively_empty(&self) -> bool {
        self.other_content.is_none()
            && self.watermark_content.is_none()
            && self.display_type.is_none()
            && self.content_colour.is_none()
            && self.font_spacing.is_none()
            && self.font_size.is_none()
            && self.water_mark_spacing.is_none()
            && self.inclination.is_none()
            && self.water_mark_transparency.is_none()
    }
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct WaterMarkOtherContent {
    user_name: Option<bool>,
    desktop_ip: Option<bool>,
    desktop_mac: Option<bool>,
    desktop_name: Option<bool>,
    desktop_time: Option<bool>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct AccessLimit {
    time_quantum: Option<TimeQuantum>,
    network: Option<Network>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct TimeQuantum {
    period: TimePeriod,
    time: Vec<String>,
    allow_access: bool,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct Network {
    network_segment: String,
    allow_access: bool,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct TimePeriod {
    period_type: TimePeriodType,
    period_value: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Display, EnumString)]
#[serde(rename_all = "camelCase")]
pub enum TimePeriodType {
    Weekly,
    Monthly,
}

#[derive(Deserialize, Debug, Clone)]
struct DesktopSafePolicy {
    #[serde(rename = "OpenTLS")]
    open_tls: Option<bool>,
    // ip_mac_bind: bool,
    // ip_mac_bind_content: String,
}

/// --- Helper for converting TerminalPolicy into command-line arguments ---
pub struct TerminalPolicyArgs<'a> {
    policy: &'a TerminalPolicy,
    desktop_name: &'a str,
    desktop_ip: &'a str,
    mac_address: &'a str,
    user_info: &'a Option<UserInfo>,
}

impl<'a> TerminalPolicyArgs<'a> {
    pub fn new(
        policy: &'a TerminalPolicy,
        desktop_name: &'a str,
        desktop_ip: &'a str,
        mac_address: &'a str,
        user_info: &'a Option<UserInfo>,
    ) -> Self {
        Self {
            policy,
            desktop_name,
            desktop_ip,
            mac_address,
            user_info,
        }
    }

    /// Converts the terminal policy into a vector of command-line arguments.
    pub fn to_args_vec(&self) -> Vec<String> {
        let mut args = Vec::new();

        // Handle WaterMark
        if let Some(water_mark) = &self.policy.water_mark {
            if !water_mark.is_effectively_empty() {
                let watermark_param_value = self.formatting_watermark_policy(water_mark);
                args.push(format!("--watermark-param=\"{}\"", watermark_param_value));
            }
        }

        // Handle AccessLimit - This is now handled by `check_access_limit` before calling this.

        // Handle DesktopConnection
        // if let Some(app_rule) = &self.policy.desktop_connection {
        //     warn!("TODO: Need to handle app rule policy");
        // }

        // ... and so on for other optional policies like user_redirect, desktop_screensaver, etc.
        // This structure is now easy to extend for all terminal policies.
        // Each policy can be checked and converted to its corresponding flag(s).

        args
    }

    fn formatting_watermark_policy(&self, watermark: &WaterMark) -> String {
        let mut result = String::new();

        // 1. Watermark Content (static text only)
        result.push_str(watermark.watermark_content.as_deref().unwrap_or(""));
        result.push(',');

        // --- Dynamic Content (user_name, desktop_ip, desktop_name, desktop_time) ---
        let other_content_ref = watermark.other_content.as_ref();
        if let Some(other) = other_content_ref {
            if other.user_name == Some(true) {
                if let Some(user) = self.user_info {
                    result.push_str(&user.user_name);
                }
            }
            result.push(',');

            if other.desktop_ip == Some(true) {
                result.push_str(self.desktop_ip);
            }
            result.push(',');

            if other.desktop_name == Some(true) {
                result.push_str(self.desktop_name);
            }
            result.push(',');

            if other.desktop_time == Some(true) {
                let now = Local::now();
                result.push_str(&now.format("%Y-%m-%d %H:%M:%S").to_string());
            }
            result.push(',');
        } else {
            // If other_content is None, we still need to add the commas for these 4 placeholders
            result.push_str(",,,,");
        }

        // 2. Display Type
        let display_type_value = if watermark.display_type.as_deref() == Some("single") {
            "0"
        } else {
            "1"
        };
        result.push_str(display_type_value);
        result.push(',');

        // 3. Content Colour
        result.push_str(watermark.content_colour.as_deref().unwrap_or(""));
        result.push(',');

        // 4. Watermark Border Color (empty)
        result.push(',');

        // 5. Font Spacing
        result.push_str(watermark.font_spacing.as_deref().unwrap_or(""));
        result.push(',');

        // 6. Font Size
        result.push_str(watermark.font_size.as_deref().unwrap_or(""));
        result.push(',');

        // 7. Watermark Spacing
        result.push_str(watermark.water_mark_spacing.as_deref().unwrap_or(""));
        result.push(',');

        // 8. Inclination
        result.push_str(watermark.inclination.as_deref().unwrap_or(""));
        result.push(',');

        // 9. Watermark Transparency
        result.push_str(watermark.water_mark_transparency.as_deref().unwrap_or(""));
        result.push(',');

        // 10. Watermark Border Opacity (empty)
        result.push(',');

        // 11. Desktop MAC Address (special case at the very end, always present)
        if let Some(other) = other_content_ref {
            if other.desktop_mac == Some(true) {
                result.push_str(self.mac_address);
            }
        }
        // No final comma needed

        result
    }
}

/// --- Builder for SPICE arguments ---
struct SpiceArgsBuilder<'a> {
    desktop_info: &'a DesktopInfo,
    spice_info: &'a DesktopSpiceInfo,
    decrypted_pwd: &'a str,
    ca_path: Option<String>,
    user_info: Option<UserInfo>,
    desktop_ip: String,
    mac_address: String,
    args: Vec<String>,
}

impl<'a> SpiceArgsBuilder<'a> {
    /// Creates a new builder instance.
    fn new(
        desktop_info: &'a DesktopInfo,
        spice_info: &'a DesktopSpiceInfo,
        decrypted_pwd: &'a str,
        ca_path: Option<String>,
        user_info: Option<UserInfo>,
        desktop_ip: String,
        mac_address: String,
    ) -> Self {
        Self {
            desktop_info,
            spice_info,
            decrypted_pwd,
            ca_path,
            user_info,
            desktop_ip,
            mac_address,
            args: Vec::new(),
        }
    }

    /// Builds the final vector of arguments.
    fn build(mut self) -> Result<Vec<String>, ConnectError> {
        self.add_base_uri();
        self.add_static_options();
        self.add_dynamic_info();
        self.add_domain_login_info()?;
        self.add_connection_policies();
        self.add_toolbar_info();
        Ok(self.args)
    }

    /// 1. Adds the core SPICE URI with the password.
    fn add_base_uri(&mut self) {
        let terminal_policy = &self.desktop_info.policy_connection_value.terminal_policy;
        let open_tls = terminal_policy
            .desktop_safe
            .as_ref()
            .and_then(|s| s.open_tls)
            .unwrap_or(false);

        let spice_uri = if open_tls {
            // Assumes console_url is in the format "host:port/tls_port"
            let parts: Vec<&str> = self.spice_info.console_url.splitn(2, ':').collect();
            let host = parts.get(0).unwrap_or(&"");
            let port_and_path: Vec<&str> = parts.get(1).unwrap_or(&"").splitn(2, '/').collect();
            let tls_port = port_and_path.get(1).unwrap_or(&"");

            format!(
                "hdp://{}/?tls-port={}&password={}",
                host, tls_port, self.decrypted_pwd
            )
        } else {
            format!(
                "hdp://{}?password={}",
                self.spice_info.console_url, self.decrypted_pwd
            )
        };

        self.args.push(spice_uri);
    }

    /// 2. Adds static command-line flags.
    fn add_static_options(&mut self) {
        self.args.push("--full-screen".to_string());
        if AppConf::read().developer_mode {
            self.args.push("--debug".to_string());
        }
    }

    /// 3. Adds arguments derived from desktop info.
    fn add_dynamic_info(&mut self) {
        self.args
            .push(format!("--title={}", self.desktop_info.name));
        self.args
            .push(format!("--vm-info=\"{},NORMAL\"", self.desktop_info.os));
        self.args
            .push(format!("--dt-cm={}", self.desktop_info.cvm_ip.clone()));
    }

    /// 4. Adds arguments derived from domain auto-login info
    fn add_domain_login_info(&mut self) -> Result<(), ConnectError> {
        if let Some(user) = &self.user_info {
            if user.login_type == LoginType::Domain {
                if let Some(domain_server_info) = &self.desktop_info.domain_server {
                    let decrypted_pwd = aes128_ecb_decrypt(&user.password)
                        .map_err(|e| ConnectError::DecryptionError(e.to_string()))?;
                    self.args
                        .push(format!("--domain=\"{}\"", domain_server_info.domain_name));
                    self.args.push(format!(
                        "--username=\"{}\"",
                        domain_server_info.desktop_login_name
                    ));
                    self.args.push(format!("--userpwd=\"{}\"", decrypted_pwd));
                }
            }
        }
        Ok(())
    }

    /// 5. Adds arguments based on connection policies.
    fn add_connection_policies(&mut self) {
        // Append protocol arguments
        let mut protocol_args = self.desktop_info.policy_connection_value.protocol.clone();
        self.args.append(&mut protocol_args);

        // Append terminal policy arguments using our helper
        let terminal_policy = &self.desktop_info.policy_connection_value.terminal_policy;
        let mut terminal_policy_args = TerminalPolicyArgs::new(
            terminal_policy,
            &self.desktop_info.name,
            &self.desktop_ip,
            &self.mac_address,
            &self.user_info,
        )
        .to_args_vec();
        self.args.append(&mut terminal_policy_args);

        // Handle DesktopSafe policy, which requires info from both TerminalPolicy and DesktopSpiceInfo
        if let Some(desktop_safe) = &terminal_policy.desktop_safe {
            if desktop_safe.open_tls == Some(true) {
                info!("Desktop safe policy enabled");
                if let Some(ca_path) = &self.ca_path {
                    self.args.push(format!("--spice-ca-file=\"{}\"", ca_path));
                } else {
                    warn!("Could not resolve path to ca-cert.pem resource.");
                }
                self.args.push(format!(
                    "--spice-host-subject=\"{}\"",
                    self.spice_info.subject
                ));
            }
        }
    }

    /// 6.Add toolbar shutdown tips
    fn add_toolbar_info(&mut self) {
        self.args.push("--toolbar-show-param=255".to_string());
        #[cfg(feature = "thin_client")]
        {
            self.args.push("--toolbar-shutdown-tips=\"1,断开连接,断开当前连接的桌面|1,关闭终端,仅关闭终端电源|1,关闭桌面,仅关闭当前桌面|1,一键关机,关闭桌面和终端\"".to_string());
        }
    }
}

/// Encrypts arguments for Linux platforms.
fn finalize_for_platform(args_vec: Vec<String>) -> Result<Vec<String>, ConnectError> {
    if cfg!(target_os = "linux") {
        let args_string = args_vec.join(" ");
        debug!("Desktop connection args (pre-encryption): {}", args_string);
        let encrypted_args = aes256_cbc_encrypt(&args_string)
            .map_err(|e| ConnectError::EncryptionError(e.to_string()))?;
        Ok(vec![format!("remote-desktop://{}", encrypted_args)])
    } else {
        Ok(args_vec)
    }
}

/// Checks if the user is allowed to connect based on time and network policies.
fn check_access_limit(policy: &TerminalPolicy) -> Result<(), ConnectError> {
    if let Some(access_limit) = &policy.access_limit {
        // 1. Check Network Policy
        if let Some(network_policy) = &access_limit.network {
            let client_ip = get_local_ip_address();
            let client_ip_addr = IpAddr::from_str(&client_ip).map_err(|_| {
                ConnectError::AccessDenied("Invalid client IP address format.".to_string())
            })?;

            let segments = network_policy.network_segment.split(';');

            let is_in_any_network = segments.into_iter().any(|segment| {
                if let Ok(policy_network) = IpNetwork::from_str(segment) {
                    return policy_network.contains(client_ip_addr);
                }
                false
            });

            if is_in_any_network != network_policy.allow_access {
                let reason = if network_policy.allow_access {
                    "Client IP is not in the allowed network range."
                } else {
                    "Client IP is in the denied network range."
                };
                return Err(ConnectError::AccessDenied(reason.to_string()));
            }
        }

        // 2. Check Time Policy
        if let Some(time_policy) = &access_limit.time_quantum {
            let now = Local::now();

            let is_day_match =
                match time_policy.period.period_type {
                    TimePeriodType::Weekly => {
                        let current_weekday = now.weekday();
                        time_policy.period.period_value.iter().any(|day_str| {
                            map_weekday_str_to_chrono(day_str) == Some(current_weekday)
                        })
                    }
                    TimePeriodType::Monthly => {
                        let current_day = now.format("%d").to_string(); // Format as "01", "02", ...
                        time_policy.period.period_value.contains(&current_day)
                    }
                };

            if is_day_match {
                // Time policy expects a two-element list of integer hour strings: [start_hour, end_hour]
                let is_time_match = if time_policy.time.len() == 2 {
                    if let (Ok(start_hour), Ok(end_hour)) = (
                        time_policy.time[0].parse::<u32>(),
                        time_policy.time[1].parse::<u32>(),
                    ) {
                        let current_hour = now.hour();
                        current_hour >= start_hour && current_hour <= end_hour
                    } else {
                        warn!("Invalid time format in policy: expected integer hours (0-23)");
                        false // Treat invalid format as no match
                    }
                } else {
                    warn!("Invalid time policy: expected two time elements (start and end hours)");
                    false // Treat invalid structure as no match
                };

                if is_time_match != time_policy.allow_access {
                    let reason = if time_policy.allow_access {
                        "Access is denied at the current time."
                    } else {
                        "Access is allowed, but current time is in a denied range."
                    };
                    return Err(ConnectError::AccessDenied(reason.to_string()));
                }
            } else if !time_policy.allow_access {
                // If it's a denied policy and today is not in the list, access is implicitly allowed for today.
            } else {
                // If it's an allowed policy and today is not in the list, access is denied.
                return Err(ConnectError::AccessDenied(
                    "Access is not allowed on this day.".to_string(),
                ));
            }
        }
    }
    Ok(())
}

/// Helper to map day strings from the policy to chrono::Weekday
fn map_weekday_str_to_chrono(day_str: &str) -> Option<Weekday> {
    match day_str {
        "1" => Some(Weekday::Mon),
        "2" => Some(Weekday::Tue),
        "3" => Some(Weekday::Wed),
        "4" => Some(Weekday::Thu),
        "5" => Some(Weekday::Fri),
        "6" => Some(Weekday::Sat),
        "7" => Some(Weekday::Sun),
        _ => None,
    }
}

/// Prepares the command-line arguments for the hdp-viewer.
pub fn prepare_spice_args(
    desktop_info: &DesktopInfo,
    spice_info: DesktopSpiceInfo,
    ca_path: Option<String>,
    user_info: Option<UserInfo>,
    desktop_ip: String,
    mac_address: String,
) -> Result<Vec<String>, ConnectError> {
    // 0. Check access policy first
    check_access_limit(&desktop_info.policy_connection_value.terminal_policy)?;

    // 1. Decrypt the password (a distinct, failable step)
    let spice_pwd_decrypted = rsa_decrypt(spice_info.pwd.clone())
        .map_err(|e| ConnectError::DecryptionError(e.to_string()))?;

    // 2. Use the builder to construct the platform-agnostic argument list
    let base_args = SpiceArgsBuilder::new(
        desktop_info,
        &spice_info,
        &spice_pwd_decrypted,
        ca_path,
        user_info,
        desktop_ip,
        mac_address,
    )
    .build()?;

    // 3. Finalize the arguments for the specific target platform (e.g., encrypt for Linux)
    finalize_for_platform(base_args)
}
