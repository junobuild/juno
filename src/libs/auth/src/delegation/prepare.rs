use crate::delegation::constants::DEFAULT_EXPIRATION_PERIOD_NS;
use crate::delegation::seed::calculate_seed;
use crate::delegation::types::{
    OpenIdPrepareDelegationArgs, PrepareDelegationError, PrepareDelegationResult, PublicKey,
    SessionKey, Timestamp,
};
use crate::openid::types::{OpenIdCredential, OpenIdCredentialKey};
use crate::state::get_salt;
use crate::state::services::mutate_state;
use crate::state::types::config::OpenIdProviderClientId;
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
    client_id: &OpenIdProviderClientId,
    credential: &OpenIdCredential,
    auth_heap: &impl AuthHeapStrategy,
    certificate: &impl AuthCertificateStrategy,
) -> PrepareDelegationResult {
    let delegation = prepare_delegation(
        &client_id,
        &OpenIdCredentialKey::from(credential),
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
        .map_err(PrepareDelegationError::DeriveSeedFailed)?;

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
