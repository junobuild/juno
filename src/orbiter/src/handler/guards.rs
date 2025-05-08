use crate::assert::constraints::assert_bot;
use crate::http::types::request::HttpRequestHeaders;
use crate::msg::ERROR_MISSING_USER_AGENT;
use ic_http_certification::StatusCode;

/// This function is used to enforce the presence of the `User-Agent` header
/// and to detect and block requests from known bots. The goal is to avoid
/// collecting analytics data from automated or non-human traffic.
pub fn assert_request_headers(headers: &HttpRequestHeaders) -> Result<(), (StatusCode, String)> {
    let user_agent = headers
        .iter()
        .find(|(key, _)| key.to_lowercase() == "user-agent")
        .map(|(_, value)| value.clone());

    if user_agent.is_none() {
        return Err((
            StatusCode::BAD_REQUEST,
            ERROR_MISSING_USER_AGENT.to_string(),
        ));
    }

    if let Err(bot_err) = assert_bot(&user_agent) {
        return Err((StatusCode::FORBIDDEN, bot_err));
    }

    Ok(())
}
