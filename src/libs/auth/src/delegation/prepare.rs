use crate::delegation::constants::DEFAULT_EXPIRATION_PERIOD_NS;
use crate::delegation::openid::jwt::types::Jwks;
use crate::delegation::openid::jwt::{unsafe_find_jwt_provider, verify_openid_jwt, GOOGLE_JWKS};
use crate::delegation::openid::seed::calculate_seed;
use crate::delegation::openid::types::OpenIdCredentialKey;
use crate::delegation::types::{
    OpenIdPrepareDelegationArgs, PrepareDelegationError, PrepareDelegationResult, PublicKey,
    SessionKey, Timestamp,
};
use crate::delegation::utils::build_nonce;
use crate::state::get_salt;
use crate::state::services::mutate_state;
use crate::state::types::config::OpenIdProviders;
use crate::state::types::runtime_state::State;
use crate::strategies::{AuthCertificateStrategy, AuthHeapStrategy};
use ic_canister_sig_creation::signature_map::CanisterSigInputs;
use ic_canister_sig_creation::{
    delegation_signature_msg, CanisterSigPublicKey, DELEGATION_SIG_DOMAIN,
};
use ic_cdk::api::{canister_self, time};
use serde_bytes::ByteBuf;

pub fn openid_prepare_delegation(
    args: &OpenIdPrepareDelegationArgs,
    providers: &OpenIdProviders,
    auth_heap: &impl AuthHeapStrategy,
    certificate: &impl AuthCertificateStrategy,
) -> PrepareDelegationResult {
    let (provider, config) = unsafe_find_jwt_provider(providers, &args.jwt)
        .map_err(|e| PrepareDelegationError::JwtFindProvider(e))?;

    // TODO
    let jwks: Jwks = serde_json::from_str(GOOGLE_JWKS)
        .map_err(|e| PrepareDelegationError::ParseJwksFailed(e.to_string()))?;

    let nonce = build_nonce(&args.salt);

    let token = verify_openid_jwt(
        &args.jwt,
        &provider.issuers(),
        &config.client_id,
        &jwks.keys,
        &nonce,
    )
    .map_err(|e| PrepareDelegationError::JwtVerify(e))?;

    let key = OpenIdCredentialKey {
        iss: token.claims.iss,
        sub: token.claims.sub,
    };

    let delegation = prepare_delegation(
        &config.client_id,
        &key,
        &args.session_key,
        auth_heap,
        certificate,
    )?;

    Ok(delegation)
}

fn prepare_delegation(
    client_id: &str,
    key: &OpenIdCredentialKey,
    session_key: &SessionKey,
    auth_heap: &impl AuthHeapStrategy,
    certificate: &impl AuthCertificateStrategy,
) -> PrepareDelegationResult {
    let expiration = time().saturating_add(DEFAULT_EXPIRATION_PERIOD_NS);
    let seed = calculate_seed(client_id, key, &get_salt(auth_heap))
        .map_err(|e| PrepareDelegationError::DeriveSeedFailed(e))?;

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
