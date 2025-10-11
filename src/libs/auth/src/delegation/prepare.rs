use crate::constants::DEFAULT_EXPIRATION_PERIOD_NS;
use crate::delegation::constants::{CLIENT_ID, GOOGLE_JWKS};
use crate::delegation::jwt::verify_rs256_with_claims;
use crate::delegation::seed::calculate_seed;
use crate::delegation::types::jwt::{Jwks, OpenIdCredentialKey};
use crate::delegation::utils::build_nonce;
use crate::state::services::mutate_state;
use crate::strategies::AuthCertificateStrategy;
use crate::types::interface::{
    OpenIdPrepareDelegationArgs, PrepareDelegationResponse, PublicKey, SessionKey, Timestamp,
};
use crate::types::runtime_state::State;
use ic_canister_sig_creation::signature_map::CanisterSigInputs;
use ic_canister_sig_creation::{
    delegation_signature_msg, CanisterSigPublicKey, DELEGATION_SIG_DOMAIN,
};
use ic_cdk::api::{canister_self, time};
use serde_bytes::ByteBuf;

pub fn openid_prepare_delegation(
    args: &OpenIdPrepareDelegationArgs,
    certificate: &impl AuthCertificateStrategy,
) -> Result<PrepareDelegationResponse, String> {
    ic_cdk::print("::openid_prepare_delegation::");

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

    ic_cdk::print(format!("Prepare claims --------> {:?}", token.claims));

    let key = OpenIdCredentialKey {
        iss: token.claims.iss,
        sub: token.claims.sub,
    };

    let delegation = prepare_delegation(&CLIENT_ID, &key, &args.session_key, certificate)?;

    Ok(delegation)
}

fn prepare_delegation(
    client_id: &str,
    key: &OpenIdCredentialKey,
    session_key: &SessionKey,
    certificate: &impl AuthCertificateStrategy,
) -> Result<PrepareDelegationResponse, String> {
    let expiration = time().saturating_add(DEFAULT_EXPIRATION_PERIOD_NS);
    let seed = calculate_seed(client_id, key, &certificate.salt())?;

    mutate_state(|state| {
        add_delegation_signature(state, session_key, seed.as_ref(), expiration);
    });

    certificate.update_certified_data();

    let delegation = (
        ByteBuf::from(der_encode_canister_sig_key(seed.to_vec())),
        expiration,
    );

    Ok(delegation)
}

fn add_delegation_signature(
    state: &mut State,
    public_key: &PublicKey,
    seed: &[u8],
    expiration: Timestamp,
) {
    let inputs = CanisterSigInputs {
        domain: DELEGATION_SIG_DOMAIN,
        seed,
        message: &delegation_signature_msg(public_key, expiration, None),
    };

    state.runtime.sigs.add_signature(&inputs);
}

fn der_encode_canister_sig_key(seed: Vec<u8>) -> Vec<u8> {
    let my_canister_id = canister_self();
    CanisterSigPublicKey::new(my_canister_id, seed).to_der()
}
