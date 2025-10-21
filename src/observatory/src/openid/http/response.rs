use candid::Nat;
use ic_cdk::management_canister::{HttpRequestResult, TransformArgs};
use ic_cdk::trap;
use junobuild_auth::openid::jwt::types::cert::Jwks;
use junobuild_shared::ic::UnwrapOrTrap;

const HTTP_STATUS_OK: u8 = 200;

// Google certs occasionally seems to return responses with keys and their properties in random order,
// so we deserialize, sort the keys and serialize to make the response the same across all nodes.
//
// We trap in case of unexpected JSON response as the http_request does not proceed result
// in case of any error or unexpected status code
pub fn transform_certificate_response(raw: TransformArgs) -> HttpRequestResult {
    let response = raw.response;

    if response.status != Nat::from(HTTP_STATUS_OK) {
        trap(format!("Invalid HTTP status code: {:?}", response.status));
    }

    let jwks: Jwks = serde_json::from_slice(&response.body)
        .map_err(|_| "Invalid Jwks JSON")
        .unwrap_or_trap();

    if jwks.keys.iter().any(|k| k.kid.is_none()) {
        trap("Missing kid in Jwks");
    }

    let mut keys = jwks.keys.clone();
    keys.sort_by(|a, b| a.kid.as_ref().unwrap().cmp(b.kid.as_ref().unwrap()));

    let body = serde_json::to_vec(&Jwks { keys })
        .map_err(|_| "Jwks serialize error")
        .unwrap_or_trap();

    HttpRequestResult {
        status: Nat::from(HTTP_STATUS_OK),
        body,
        headers: vec![],
    }
}
