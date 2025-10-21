use crate::openid::constants::FETCH_CERTIFICATE_INTERVAL;
use crate::openid::http::request::get_certificate;
use crate::store::heap::{assert_scheduler_running, set_openid_certificate};
use crate::types::state::OpenIdProvider;
use ic_cdk::futures::spawn;
use ic_cdk_timers::set_timer;
use junobuild_auth::openid::jwt::types::cert::Jwks;
use junobuild_shared::time::parse_text_datetime_ns;
use serde_json::from_slice;
use std::cmp::min;
use std::time::Duration;

pub fn schedule_certificate_update(provider: OpenIdProvider, delay: Option<u64>) {
    if assert_scheduler_running(&provider).is_err() {
        return;
    }

    set_timer(Duration::from_secs(delay.unwrap_or(0)), move || {
        spawn(async move {
            let result = fetch_and_save_certificate(&provider).await;

            let next_delay = if result.is_ok() {
                FETCH_CERTIFICATE_INTERVAL
            } else {
                // Try again with backoff if fetch failed. e.g. the HTTPS outcall responses
                // aren't the same across nodes when we fetch at the moment of key rotation.
                min(FETCH_CERTIFICATE_INTERVAL, delay.unwrap_or(60) * 2)
            };

            schedule_certificate_update(provider, Some(next_delay));
        })
    });
}

async fn fetch_and_save_certificate(provider: &OpenIdProvider) -> Result<(), String> {
    let http_result = get_certificate(provider).await?;

    let raw_json_value = http_result.body;

    let expires_at = http_result
        .headers
        .iter()
        .find(|header| header.name.eq_ignore_ascii_case("expires"))
        .and_then(|header| parse_text_datetime_ns(&header.value));

    let jwks = from_slice::<Jwks>(&raw_json_value).map_err(|e| e.to_string())?;

    set_openid_certificate(provider, &jwks, &expires_at);

    Ok(())
}

