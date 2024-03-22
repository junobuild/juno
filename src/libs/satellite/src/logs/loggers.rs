use crate::logs::types::logs::{Log, LogLevel};
use crate::memory::STATE;
use crate::rules::constants::LOG_COLLECTION_KEY;
use crate::{set_doc_store, Key, SetDoc};
use ic_cdk::api::time;
use ic_cdk::caller;
use junobuild_utils::encode_doc_data;
use rand::Rng;

pub fn log(message: String) -> Result<(), String> {
    let nonce = random()?;

    let key: Key = format!("{}-{}", time(), nonce);

    let log: Log = Log {
        level: LogLevel::Info,
        message,
        data: None,
    };

    let doc: SetDoc = SetDoc {
        updated_at: None,
        description: None,
        data: encode_doc_data(&log)?,
    };

    set_doc_store(caller(), LOG_COLLECTION_KEY.to_string(), key, doc)?;

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
