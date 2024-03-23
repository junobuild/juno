use crate::logs::types::logs::{Log, LogLevel};
use crate::memory::STATE;
use crate::rules::constants::LOG_COLLECTION_KEY;
use crate::{set_doc_store, Key, SetDoc};
use ic_cdk::api::time;
use ic_cdk::id;
use junobuild_utils::encode_doc_data;
use rand::Rng;
use serde::Serialize;

pub fn log(message: String) -> Result<(), String> {
    set_log::<()>(LogLevel::Info, message, None)
}

pub fn log_with_data<T: Serialize>(message: String, data: &T) -> Result<(), String> {
    set_log::<T>(LogLevel::Info, message, Some(data))
}

pub fn info(message: String) -> Result<(), String> {
    set_log::<()>(LogLevel::Info, message, None)
}

pub fn info_with_data<T: Serialize>(message: String, data: &T) -> Result<(), String> {
    set_log::<T>(LogLevel::Info, message, Some(data))
}

pub fn debug(message: String) -> Result<(), String> {
    set_log::<()>(LogLevel::Debug, message, None)
}

pub fn debug_with_data<T: Serialize>(message: String, data: &T) -> Result<(), String> {
    set_log::<T>(LogLevel::Debug, message, Some(data))
}

pub fn warn(message: String) -> Result<(), String> {
    set_log::<()>(LogLevel::Warning, message, None)
}

pub fn warn_with_data<T: Serialize>(message: String, data: &T) -> Result<(), String> {
    set_log::<T>(LogLevel::Warning, message, Some(data))
}

pub fn error(message: String) -> Result<(), String> {
    set_log::<()>(LogLevel::Error, message, None)
}

pub fn error_with_data<T: Serialize>(message: String, data: &T) -> Result<(), String> {
    set_log::<T>(LogLevel::Error, message, Some(data))
}

fn set_log<T: Serialize>(level: LogLevel, message: String, data: Option<&T>) -> Result<(), String> {
    let nonce = random()?;

    let key: Key = format!("{}-{}", time(), nonce);

    let log_data = data.map(encode_doc_data).transpose()?;

    let log: Log = Log {
        level,
        message,
        data: log_data,
    };

    let doc: SetDoc = SetDoc {
        description: None,
        data: encode_doc_data(&log)?,
        updated_at: None,
    };

    set_doc_store(id(), LOG_COLLECTION_KEY.to_string(), key, doc)?;

    Ok(())
}

fn random() -> Result<i32, String> {
    STATE.with(|state| {
        let rng = &mut state.borrow_mut().runtime.rng;

        match rng {
            None => Err("The random number generator has not been initialized.".to_string()),
            Some(rng) => Ok(rng.gen()),
        }
    })
}
