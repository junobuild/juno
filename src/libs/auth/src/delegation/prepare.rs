use crate::delegation::duration::build_expiration;
use crate::delegation::seed::calculate_seed;
use crate::delegation::targets::{build_targets, targets_to_bytes};
use crate::delegation::types::{
    DelegationTargets, PrepareDelegationError, PrepareDelegationResult, PreparedDelegation,
    PublicKey, SessionKey, Timestamp,
};
use crate::openid::types::interface::{OpenIdCredential, OpenIdCredentialKey};
use crate::state::get_salt;
use crate::state::services::mutate_state;
use crate::state::types::config::OpenIdProviderClientId;
use crate::state::types::runtime_state::State;
use crate::strategies::{AuthCertificateStrategy, AuthHeapStrategy};
use ic_canister_sig_creation::signature_map::CanisterSigInputs;
use ic_canister_sig_creation::{
    delegation_signature_msg, CanisterSigPublicKey, DELEGATION_SIG_DOMAIN,
};
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
        &client_id,
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

    let expiration = build_expiration(auth_heap);

    let targets = build_targets(auth_heap);

    mutate_state(|state| {
        add_delegation_signature(state, session_key, seed.as_ref(), expiration, &targets);
    });

    certificate.update_certified_data();

    let delegation = PreparedDelegation {
        user_key: ByteBuf::from(der_encode_canister_sig_key(seed.to_vec())),
    };

    Ok(delegation)
}

fn add_delegation_signature(
    state: &mut State,
    public_key: &PublicKey,
    seed: &[u8],
    expiration: Timestamp,
    targets: &Option<DelegationTargets>,
) {
    let inputs = CanisterSigInputs {
        domain: DELEGATION_SIG_DOMAIN,
        seed,
        message: &delegation_signature_msg(
            public_key,
            expiration,
            targets_to_bytes(targets).as_ref(),
        ),
    };

    state.runtime.sigs.add_signature(&inputs);
}

fn der_encode_canister_sig_key(seed: Vec<u8>) -> Vec<u8> {
    let my_canister_id = canister_self();
    CanisterSigPublicKey::new(my_canister_id, seed).to_der()
}
