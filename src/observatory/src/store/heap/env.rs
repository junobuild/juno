use crate::memory::state::services::{mutate_heap_state, read_heap_state};
use crate::types::state::{ApiKey, Env, HeapState};

pub fn set_env(env: &Env) {
    mutate_heap_state(|heap| set_env_impl(env, heap))
}

fn set_env_impl(env: &Env, state: &mut HeapState) {
    state.env = Some(env.clone());
}

pub fn get_email_api_key() -> Result<ApiKey, String> {
    let env = read_heap_state(|heap| heap.env.clone());

    if let Some(env) = env {
        if let Some(email_api_key) = env.email_api_key {
            return Ok(email_api_key);
        }
    }

    Err("No API key is set to send email.".to_string())
}
