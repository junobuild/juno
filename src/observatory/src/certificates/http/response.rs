use candid::Nat;
use ic_cdk::api::management_canister::http_request::{HttpResponse, TransformArgs};
use junobuild_auth::openid::jwt::types::cert::Jwks;

const HTTP_STATUS_OK: u8 = 200;
const HTTP_STATUS_BAD_GATEWAY: u16 = 502;
const HTTP_STATUS_INTERNAL_SERVER_ERROR: u16 = 500;

// Google certs occasionally seems to return responses with keys and their properties in random order,
// so we deserialize, sort the keys and serialize to make the response the same across all nodes.
pub fn transform_certificate_response(raw: TransformArgs) -> HttpResponse {
    let response = raw.response;

    if response.status != Nat::from(HTTP_STATUS_OK) {
        return response;
    }

    let jwks: Jwks = match serde_json::from_slice(&response.body) {
        Ok(v) => v,
        Err(_) => {
            return HttpResponse {
                status: Nat::from(HTTP_STATUS_BAD_GATEWAY),
                body: br#"{"error":"invalid json"}"#.to_vec(),
                headers: vec![],
            }
        }
    };

    if jwks.keys.iter().any(|k| k.kid.is_none()) {
        return HttpResponse {
            status: Nat::from(HTTP_STATUS_BAD_GATEWAY),
            body: br#"{"error":"missing kid"}"#.to_vec(),
            headers: vec![],
        };
    }

    let mut keys = jwks.keys.clone();
    keys.sort_by(|a, b| a.kid.as_ref().unwrap().cmp(b.kid.as_ref().unwrap()));

    let body = match serde_json::to_vec(&Jwks { keys }) {
        Ok(jwks) => jwks,
        Err(_) => {
            return HttpResponse {
                status: Nat::from(HTTP_STATUS_INTERNAL_SERVER_ERROR),
                body: br#"{"error":"serialize error"}"#.to_vec(),
                headers: vec![],
            }
        }
    };

    HttpResponse {
        status: Nat::from(HTTP_STATUS_OK),
        body,
        headers: vec![],
    }
}
