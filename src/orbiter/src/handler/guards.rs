use crate::http::types::request::HttpRequestHeaders;
use crate::msg::{ERROR_BOT_CALL, ERROR_MISSING_USER_AGENT};
use ic_http_certification::StatusCode;
use isbot::Bots;

/// This function is used to enforce the presence of the `User-Agent` header
/// and to detect and block requests from known bots. The goal is to avoid
/// collecting analytics data from automated or non-human traffic.
pub fn assert_request_headers(headers: &HttpRequestHeaders) -> Result<(), (StatusCode, String)> {
    let user_agent = headers
        .iter()
        .find(|(key, _)| key.eq_ignore_ascii_case("user-agent"))
        .map(|(_, value)| value);

    let user_agent = match user_agent {
        Some(user_agent) => user_agent,
        None => {
            return Err((
                StatusCode::BAD_REQUEST,
                ERROR_MISSING_USER_AGENT.to_string(),
            ));
        }
    };

    if let Err(bot_err) = assert_bot(user_agent) {
        return Err((StatusCode::FORBIDDEN, bot_err));
    }

    Ok(())
}

fn assert_bot(user_agent: &str) -> Result<(), String> {
    let bots = Bots::default();

    if bots.is_bot(user_agent) {
        return Err(ERROR_BOT_CALL.to_string());
    }

    Ok(())
}
