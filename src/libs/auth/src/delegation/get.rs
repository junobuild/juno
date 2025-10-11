use crate::delegation::constants::{CLIENT_ID, GOOGLE_JWKS};
use crate::delegation::jwt::verify_rs256_with_claims;
use crate::delegation::seed::calculate_seed;
use crate::delegation::types::jwt::{Jwks, OpenIdCredentialKey};
use crate::delegation::utils::build_nonce;
use crate::state::services::read_state;
use crate::strategies::AuthCertificateStrategy;
use crate::types::interface::{
    Delegation, GetDelegationResponse, OpenIdGetDelegationArgs, SessionKey, SignedDelegation,
    Timestamp,
};
use ic_canister_sig_creation::signature_map::CanisterSigInputs;
use ic_canister_sig_creation::{delegation_signature_msg, DELEGATION_SIG_DOMAIN};
use serde_bytes::ByteBuf;

pub fn openid_get_delegation(
    args: &OpenIdGetDelegationArgs,
    certificate: &impl AuthCertificateStrategy,
) -> Result<GetDelegationResponse, String> {
    ic_cdk::print("::openid_get_delegation::");

    let jwks: Jwks = serde_json::from_str(GOOGLE_JWKS).map_err(|e| format!("invalid JWKS: {e}"))?;

    let nonce = build_nonce(&args.salt);

    let token = verify_rs256_with_claims(
        &args.jwt,
        &["https://accounts.google.com", "accounts.google.com"],
        CLIENT_ID,
        &jwks.keys,
        &nonce,
    )
    .map_err(|e| format!("{e:?}"))?;

    ic_cdk::print(format!("Get claims --------> {:?}", token.claims));

    let key = OpenIdCredentialKey {
        iss: token.claims.iss,
        sub: token.claims.sub,
    };

    get_delegation(
        &CLIENT_ID,
        &key,
        &args.session_key,
        &args.expiration,
        certificate,
    )
}

pub fn get_delegation(
    client_id: &str,
    key: &OpenIdCredentialKey,
    session_key: &SessionKey,
    expiration: &Timestamp,
    certificate: &impl AuthCertificateStrategy,
) -> Result<GetDelegationResponse, String> {
    let seed = calculate_seed(client_id, key, &certificate.salt())?;

    let response = read_state(|state| {
        let inputs = CanisterSigInputs {
            domain: DELEGATION_SIG_DOMAIN,
            seed: &seed,
            message: &delegation_signature_msg(&session_key, expiration.clone(), None),
        };

        let certified_assets_root_hash = certificate.get_asset_hashes_root_hash();

        match state
            .runtime
            .sigs
            .get_signature_as_cbor(&inputs, Some(certified_assets_root_hash))
        {
            Ok(signature) => GetDelegationResponse::SignedDelegation(SignedDelegation {
                delegation: Delegation {
                    pubkey: session_key.clone(),
                    expiration: expiration.clone(),
                    targets: None,
                },
                signature: ByteBuf::from(signature),
            }),
            Err(_) => GetDelegationResponse::NoSuchDelegation,
        }
    });

    Ok(response)
}
