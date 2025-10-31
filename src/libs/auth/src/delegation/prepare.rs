use crate::delegation::types::{
    PrepareDelegationError, PrepareDelegationResult, PreparedDelegation, PublicKey, SessionKey,
    Timestamp,
};
use crate::delegation::utils::duration::build_expiration;
use crate::delegation::utils::seed::calculate_seed;
use crate::delegation::utils::signature::{build_signature_inputs, build_signature_msg};
use crate::delegation::utils::targets::build_targets;
use crate::openid::types::interface::{OpenIdCredential, OpenIdCredentialKey};
use crate::openid::types::provider::OpenIdProvider;
use crate::state::get_salt;
use crate::state::services::mutate_state;
use crate::strategies::{AuthCertificateStrategy, AuthHeapStrategy};
use ic_canister_sig_creation::CanisterSigPublicKey;
use ic_cdk::api::canister_self;
use serde_bytes::ByteBuf;

pub fn openid_prepare_delegation(
    session_key: &SessionKey,
    credential: &OpenIdCredential,
    provider: &OpenIdProvider,
    auth_heap: &impl AuthHeapStrategy,
    certificate: &impl AuthCertificateStrategy,
) -> PrepareDelegationResult {
    let delegation = prepare_delegation(
        session_key,
        &OpenIdCredentialKey::from(credential),
        provider,
        auth_heap,
        certificate,
    )?;

    Ok(delegation)
}

fn prepare_delegation(
    session_key: &SessionKey,
    key: &OpenIdCredentialKey,
    provider: &OpenIdProvider,
    auth_heap: &impl AuthHeapStrategy,
    certificate: &impl AuthCertificateStrategy,
) -> PrepareDelegationResult {
    let seed = calculate_seed(key, &get_salt(auth_heap))
        .map_err(PrepareDelegationError::DeriveSeedFailed)?;

    let expiration = build_expiration(provider, auth_heap);

    add_delegation_signature(session_key, expiration, provider, seed.as_ref(), auth_heap);

    certificate.update_certified_data();

    let delegation = PreparedDelegation {
        user_key: ByteBuf::from(der_encode_canister_sig_key(seed.to_vec())),
        expiration,
    };

    Ok(delegation)
}

fn add_delegation_signature(
    session_key: &PublicKey,
    expiration: Timestamp,
    provider: &OpenIdProvider,
    seed: &[u8],
    auth_heap: &impl AuthHeapStrategy,
) {
    let targets = build_targets(provider, auth_heap);

    let message = build_signature_msg(session_key, expiration, &targets);

    let inputs = build_signature_inputs(seed, &message);

    mutate_state(|state| {
        state.runtime.sigs.add_signature(&inputs);
    });
}

fn der_encode_canister_sig_key(seed: Vec<u8>) -> Vec<u8> {
    let my_canister_id = canister_self();
    CanisterSigPublicKey::new(my_canister_id, seed).to_der()
}
