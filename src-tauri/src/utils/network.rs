use std::net::ToSocketAddrs;
use tokio::net::TcpStream;
use tokio::time::{timeout, Duration};
use tracing::{debug, warn};

pub fn get_local_ip_address() -> String {
    match local_ip_address::local_ip() {
        Ok(ip) => ip.to_string(),
        Err(e) => {
            warn!(
                "Failed to get local IP address, defaulting to 127.0.0.1: {}",
                e
            );
            "127.0.0.1".to_string()
        }
    }
}

pub async fn diagnose_port(ip: &str, port: u16) -> bool {
    let address = format!("{}:{}", ip, port);
    debug!("Diagnosing network port: {}", address);
    let socket_addr = match address.to_socket_addrs() {
        Ok(mut addrs) => match addrs.next() {
            Some(addr) => addr,
            None => {
                warn!("No socket addresses found for {}", address);
                return false;
            }
        },
        Err(e) => {
            warn!("Failed to parse socket address {}: {}", address, e);
            return false;
        }
    };

    match timeout(Duration::from_secs(3), TcpStream::connect(socket_addr)).await {
        Ok(Ok(_)) => {
            debug!("Successfully connected to {}", address);
            true
        }
        Ok(Err(e)) => {
            debug!("Failed to connect to {}: {}", address, e);
            false
        }
        Err(_) => {
            debug!("Connection attempt to {} timed out", address);
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::IpAddr;
    use tokio::net::TcpListener;

    #[test]
    fn test_get_local_ip_address() {
        let ip_str = get_local_ip_address();

        // 1. Check that the function returns a non-empty string.
        assert!(
            !ip_str.is_empty(),
            "The returned IP address string should not be empty."
        );

        // 2. Check that the returned string is a valid IP address.
        let ip_parse_result = ip_str.parse::<IpAddr>();
        assert!(
            ip_parse_result.is_ok(),
            "The returned string '{}' should be a valid IP address.",
            ip_str
        );
    }

    #[tokio::test]
    async fn test_diagnose_port_open() {
        // Bind a listener to a random available port
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let port = listener.local_addr().unwrap().port();

        // The port is open, so diagnose_port should return true
        assert!(diagnose_port("127.0.0.1", port).await);
    }

    #[tokio::test]
    async fn test_diagnose_port_closed() {
        // Pick a port that is highly unlikely to be in use.
        // Note: This could theoretically fail if the port is in use, but it's very unlikely.
        let port = 65534;
        assert!(!diagnose_port("127.0.0.1", port).await);
    }

    #[tokio::test]
    async fn test_diagnose_port_invalid_address() {
        // Use an invalid address format
        assert!(!diagnose_port("invalid-address", 80).await);
    }
}
