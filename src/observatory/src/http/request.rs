use crate::http::types::EmailRequestBody;
use crate::types::state::{ApiKey, DepositedCyclesEmailNotification, NotificationKey};
use ic_cdk::api::management_canister::http_request::http_request as http_request_outcall;
use ic_cdk::api::management_canister::http_request::{
    CanisterHttpRequestArgument, HttpHeader, HttpMethod,
};
use ic_cdk::print;
use serde_json::json;

pub async fn post_email(
    idempotency_key: &String,
    api_key: &ApiKey,
    email: &EmailRequestBody,
) -> Result<(), String> {
    let request = get_email_request(idempotency_key, api_key, email)?;

    print(format!(
        "🔫 ---------> Starting the request. {}",
        request.url
    ));

    match http_request_outcall(request, 5_000_000_000).await {
        Ok((_response,)) => {
            print("✅ ---------> Request processed.");
            Ok(())
        }
        Err((r, m)) => {
            let message = format!("HTTP request error. RejectionCode: {:?}, Error: {}", r, m);
            Err(format!("‼️ --> {}.", message))
        }
    }
}

fn get_email_request(
    idempotency_key: &String,
    api_key: &ApiKey,
    email: &EmailRequestBody,
) -> Result<CanisterHttpRequestArgument, String> {
    let email_notifications_url =
        "https://europe-west6-juno-observatory.cloudfunctions.net/observatory/notifications/email";

    let request_headers = vec![
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
        },
        HttpHeader {
            name: "idempotency-key".to_string(),
            value: idempotency_key.to_owned(),
        },
        HttpHeader {
            name: "authorization".to_string(),
            value: format!("Bearer {}", api_key),
        },
    ];

    let body = json!(email);

    let body_json = serde_json::to_string(&body).map_err(|e| e.to_string())?;

    Ok(CanisterHttpRequestArgument {
        url: email_notifications_url.to_string(),
        method: HttpMethod::POST,
        body: Some(body_json.as_bytes().to_vec()),
        max_response_bytes: None,
        transform: None,
        headers: request_headers,
    })
}
