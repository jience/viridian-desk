use std::fmt;
use std::error::Error as StdError;
use serde::{Serialize, Deserialize};

/// 定义API的错误类型
#[derive(Debug, Serialize, Deserialize)]
pub enum ApiError {
  NotFound(String),
  BadRequest(String),
  InternalServerError(String),
}

/// 实现 Display trait 用于将错误信息格式化为字符串
impl fmt::Display for ApiError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    match self {
      ApiError::NotFound(msg) => write!(f, "Not Found: {}", msg),
      ApiError::BadRequest(msg) => write!(f, "Bad Request: {}", msg),
      ApiError::InternalServerError(msg) => write!(f, "Internal Server Error: {}", msg),
    }
  }
}

/// 实现 Error trait 用于与标准库中的错误类型交互
impl StdError for ApiError {}

/// 定义 Result 类型，包含ApiError
pub type ApiResult<T> = Result<T, ApiError>;

