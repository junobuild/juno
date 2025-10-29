use crate::delegation::duration::build_expiration;
use crate::delegation::seed::calculate_seed;
use crate::delegation::signature::{build_signature_inputs, build_signature_msg};
use crate::delegation::targets::build_targets;
use crate::delegation::types::{
    PrepareDelegationError, PrepareDelegationResult, PreparedDelegation, PublicKey, SessionKey,
};
use crate::openid::types::interface::{OpenIdCredential, OpenIdCredentialKey};
use crate::state::get_salt;
use crate::state::services::mutate_state;
use crate::state::types::config::OpenIdProviderClientId;
use crate::strategies::{AuthCertificateStrategy, AuthHeapStrategy};
use ic_canister_sig_creation::CanisterSigPublicKey;
use ic_cdk::api::canister_self;
use serde_bytes::ByteBuf;

pub fn openid_prepare_delegation(
    session_key: &SessionKey,
    client_id: &OpenIdProviderClientId,
    credential: &OpenIdCredential,
    auth_heap: &impl AuthHeapStrategy,
    certificate: &impl AuthCertificateStrategy,
) -> PrepareDelegationResult {
    let delegation = prepare_delegation(
        session_key,
        client_id,
        &OpenIdCredentialKey::from(credential),
        auth_heap,
        certificate,
    )?;

    Ok(delegation)
}

fn prepare_delegation(
    session_key: &SessionKey,
    client_id: &str,
    key: &OpenIdCredentialKey,
    auth_heap: &impl AuthHeapStrategy,
    certificate: &impl AuthCertificateStrategy,
) -> PrepareDelegationResult {
    let seed = calculate_seed(client_id, key, &get_salt(auth_heap))
        .map_err(PrepareDelegationError::DeriveSeedFailed)?;

    add_delegation_signature(session_key, seed.as_ref(), auth_heap);

    certificate.update_certified_data();

    let delegation = PreparedDelegation {
        user_key: ByteBuf::from(der_encode_canister_sig_key(seed.to_vec())),
    };

    Ok(delegation)
}

fn add_delegation_signature(
    session_key: &PublicKey,
    seed: &[u8],
    auth_heap: &impl AuthHeapStrategy,
) {
    let expiration = build_expiration(auth_heap);

    let targets = build_targets(auth_heap);

    let message = build_signature_msg(session_key, expiration, &targets);

    let inputs = build_signature_inputs(seed.as_ref(), &message);

    mutate_state(|state| {
        state.runtime.sigs.add_signature(&inputs);
    });
}

fn der_encode_canister_sig_key(seed: Vec<u8>) -> Vec<u8> {
    let my_canister_id = canister_self();
    CanisterSigPublicKey::new(my_canister_id, seed).to_der()
}
