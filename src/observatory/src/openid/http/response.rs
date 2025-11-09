use crate::openid::http::types::JwksJson;
use candid::Nat;
use ic_cdk::management_canister::{HttpRequestResult, TransformArgs};
use ic_cdk::trap;
use junobuild_auth::openid::jwt::types::cert::Jwks;
use junobuild_shared::ic::UnwrapOrTrap;

const HTTP_STATUS_OK: u8 = 200;

/// Google’s JWKS may arrive with keys/fields in arbitrary order.
/// To make downstream behavior deterministic across replicas, we:
/// 1) parse the raw JSON (Google’s flattened JWK shape),
/// 2) convert it into our Candid-safe types (variant `params`),
/// 3) sort keys by `kid`,
/// 4) re-serialize to JSON (still our Candid-safe JWK shape).
///
/// Notes:
/// - We *trap* on any unexpected input because `http_request` does not surface
///   an application-level error to the caller; the transform must decide.
/// - Google uses flattened params (`n/e`, `crv/x/y`, …) per JWK. Our Candid-safe
///   type keeps `params` as a *variant* (Rsa/Ec/Oct/Okp). We parse with JSON DTOs
///   (`JwksJson`/`JwkJson`) then convert to `Jwks` for stable Candid.
/// - We require `kid` for every key (common operational invariant).
pub fn transform_certificate_response(raw: TransformArgs) -> HttpRequestResult {
    let response = raw.response;

    if response.status != HTTP_STATUS_OK {
        trap(format!("Invalid HTTP status code: {:?}", response.status));
    }

    // Parse Google JWKS JSON (flattened), then convert to our core JWK shape.
    let jwks_json: JwksJson = serde_json::from_slice(&response.body)
        .map_err(|_| "Invalid Jwks JSON")
        .unwrap_or_trap();

    let jwks: Jwks = jwks_json.into();

    // Enforce presence of `kid` for all keys (helps deterministic ordering + ops).
    if jwks.keys.iter().any(|k| k.kid.is_none()) {
        trap("Missing kid in Jwks");
    }

    // Deterministic order: sort by kid.
    let mut keys = jwks.keys.clone();
    keys.sort_by(|a, b| a.kid.as_ref().unwrap().cmp(b.kid.as_ref().unwrap()));

    // Re-serialize in our Candid-safe JSON shape.
    let body = serde_json::to_vec(&Jwks { keys })
        .map_err(|_| "Jwks serialize error")
        .unwrap_or_trap();

    HttpRequestResult {
        status: Nat::from(HTTP_STATUS_OK),
        body,
        headers: vec![],
    }
}
