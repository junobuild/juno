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
    set_log::<()>(message, None)
}

pub fn log_with_data<T: Serialize>(message: String, data: &T) -> Result<(), String> {
    set_log::<T>(message, Some(data))
}

fn set_log<T: Serialize>(message: String, data: Option<&T>) -> Result<(), String> {
    let nonce = random()?;

    let key: Key = format!("{}-{}", time(), nonce);

    let log_data = data.map(encode_doc_data).transpose()?;

    let log: Log = Log {
        level: LogLevel::Info,
        message,
        data: log_data,
    };

    let doc: SetDoc = SetDoc {
        updated_at: None,
        description: None,
        data: encode_doc_data(&log)?,
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
