use anyhow::{Context, Result};
use base64::{engine::general_purpose, Engine as _};
use cbc::cipher::{block_padding::Pkcs7, BlockDecryptMut, BlockEncryptMut, KeyIvInit};
use ecb::cipher::KeyInit;
use rsa::{pkcs1::DecodeRsaPrivateKey, Pkcs1v15Encrypt, RsaPrivateKey};

const PRIVATE_PEM: &'static str = "-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQCYmB/+/WeY46F1/xfYJ0KT7qGnJAwMUKOWiiqwbefHO1QvMSk8
TR6umLJVKdTaaYXkAnr5Szfh/6h2tUoofzQ65hUD6jiixnKIiZOMjGkRwFh8pFlb
p2HYd6OMXW8DPVjxlbF4rQwjezVihYpht2JwCBD1Yboy5lFBGxxIdEiPtwIDAQAB
AoGABEBo08/3rPjarND4txsQ7dI+SsvkUguFI1KiMdw+Ev0CMXZrMbTsX+z9OwY5
WgSKqHmxN3TzD6bx6KzQbiRtLhOpQlNpWIxaM8+RtXGrJH8xAyvkqG5PdF0zNUmX
nSYqasOlMLZ5b7itGNtvQtirnsgg75ihcfpPdKB26eFDRUECQQD1Yra79k2adyc6
n54I2w5menPRXQr4pE7cpn/RjlyLNmSKk4g5l6/UWn/fR4So74y/S6X/6oDwFWoa
dudsDsBxAkEAnzHh+d8UKaIxHNRirzbJiwFQMp+9Vv42zB4RM21OH0TouT+JUBqy
uYbVHbFMqbjIZtAA7rQhl9H/84grc7xmpwJBAKqcDa02HNKu0ami3QAPPj3mGayR
YlVp+CLV6LzMnG92TAVFekuAuZGNsqaNVSEYHOXMNQhwBWHnobPwxAqPXyECQQCa
YWKW0eoYsexU2/ZTmpr6zaw7W8PfECqN6f6eU7r2Afp6Y45C+5Ek8AfOgrkowkS9
x6uP0WnedE11mzEgTK1zAkAXHzc4e6XxNRCuRuufUOCDLyKNQrWOvwdqfBz1Y6Mp
Mjj7JQj5oBM5cfo23ZJmuB9Vo4fqQOvX3Kig9qkfXXXy
-----END RSA PRIVATE KEY-----";

static AES_CBC_KEY: [u8; 32] = [
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
    0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
];
const AES_IV: [u8; 16] = [
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
];
const AES_ECB_KEY: &[u8] = b"QWER1234asdf5678";
type Aes128EcbEnc = ecb::Encryptor<aes::Aes128>;
type Aes128EcbDec = ecb::Decryptor<aes::Aes128>;
type Aes256CbcEnc = cbc::Encryptor<aes::Aes256>;
type Aes256CbcDec = cbc::Decryptor<aes::Aes256>;

pub fn rsa_decrypt(encrypted_data: String) -> Result<String> {
    let private_key = RsaPrivateKey::from_pkcs1_pem(PRIVATE_PEM)
        .context("Failed to load private pem for decryption")?;

    let decoded_encrypted_data = general_purpose::STANDARD
        .decode(&encrypted_data)
        .context("Failed to decode Base64 string during decryption")?;

    let decrypted_data = private_key
        .decrypt(Pkcs1v15Encrypt, &decoded_encrypted_data)
        .context("Failed to decrypt data with RSA private key")?;

    Ok(String::from_utf8_lossy(&decrypted_data).to_string())
}

pub fn aes128_ecb_encrypt(data: &str) -> Result<String> {
    let cipher = Aes128EcbEnc::new(AES_ECB_KEY.into());
    let encrypted = cipher.encrypt_padded_vec_mut::<Pkcs7>(data.as_bytes());
    Ok(general_purpose::STANDARD.encode(&encrypted))
}

pub fn aes128_ecb_decrypt(encrypted_data: &str) -> Result<String> {
    let encrypted_bytes = general_purpose::STANDARD.decode(encrypted_data)?;
    let cipher = Aes128EcbDec::new(AES_ECB_KEY.into());
    let decrypted_bytes = cipher
        .decrypt_padded_vec_mut::<Pkcs7>(&encrypted_bytes)
        .map_err(|e| anyhow::anyhow!("Failed to decrypt data with AES-128—ECB: {}", e))?;
    Ok(String::from_utf8(decrypted_bytes)?)
}

pub fn aes256_cbc_encrypt(data: &str) -> Result<String> {
    // todo: 必须采用随机的初始化向量
    // let mut iv = [0u8; 16];
    // rand::thread_rng().fill_bytes(&mut iv);

    let cipher = Aes256CbcEnc::new((&AES_CBC_KEY).into(), &AES_IV.into());
    let encrypted = cipher.encrypt_padded_vec_mut::<Pkcs7>(data.as_bytes());

    Ok(general_purpose::STANDARD.encode(&encrypted))
}

pub fn aes256_cbc_decrypt(encrypted_data_b64: &str) -> Result<String> {
    let encrypted_data = general_purpose::STANDARD.decode(encrypted_data_b64)?;
    if encrypted_data.len() < 16 {
        return Err(anyhow::anyhow!(
            "Encrypted data is too short to contain an IV"
        ));
    }

    let cipher = Aes256CbcDec::new((&AES_CBC_KEY).into(), &AES_IV.into());
    let decrypted_bytes = cipher
        .decrypt_padded_vec_mut::<Pkcs7>(&encrypted_data)
        .map_err(|e| anyhow::anyhow!("Failed to decrypt data with AES-256-CBC: {}", e))?;

    Ok(String::from_utf8(decrypted_bytes)?)
}

#[cfg(test)]
mod tests {
    use super::*; // 导入外部模块的所有公共项

    #[test]
    fn test_aes256_cbc_encrypt_decrypt_success() {
        let original_text = "This is a secret message for testing purposes.";

        // 1. 加密
        let encrypted_b64 = aes256_cbc_encrypt(original_text).unwrap();

        // 2. 解密
        let decrypted_text = aes256_cbc_decrypt(&encrypted_b64).unwrap();

        // 3. 验证
        assert_eq!(
            original_text, decrypted_text,
            "Decrypted text should match the original text."
        );
    }

    #[test]
    fn test_decrypt_invalid_base64() {
        let invalid_b64 = "this is not valid base64===";
        let result = aes256_cbc_decrypt(invalid_b64);
        assert!(result.is_err(), "Should fail with invalid base64 input");
    }

    #[test]
    fn test_decrypt_data_too_short() {
        let short_data_b64 = general_purpose::STANDARD.encode(&[0, 1, 2, 3, 4, 5]);
        let result = aes256_cbc_decrypt(&short_data_b64);
        assert!(
            result.is_err(),
            "Should fail when data is too short to be valid"
        );
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("too short to contain an IV"));
    }

    #[test]
    fn test_decrypt_tampered_data() {
        let original_text = "another message";
        let mut encrypted_bytes = base64::engine::general_purpose::STANDARD
            .decode(aes256_cbc_encrypt(original_text).unwrap())
            .unwrap();

        // 篡改密文的最后一个字节
        let last_byte_index = encrypted_bytes.len() - 1;
        encrypted_bytes[last_byte_index] ^= 0xff; // Flip all bits

        let tampered_b64 = base64::engine::general_purpose::STANDARD.encode(&encrypted_bytes);

        let result = aes256_cbc_decrypt(&tampered_b64);
        assert!(result.is_err(), "Decryption should fail for tampered data");
    }
}
