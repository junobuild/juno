use crate::delegation::seed::calculate_seed;
use crate::delegation::targets::{delegation_targets, targets_to_bytes};
use crate::delegation::types::{
    Delegation, GetDelegationError, GetDelegationResult, OpenIdGetDelegationArgs, SessionKey,
    SignedDelegation, Timestamp,
};
use crate::openid::types::interface::{OpenIdCredential, OpenIdCredentialKey};
use crate::state::get_salt;
use crate::state::services::read_state;
use crate::state::types::config::OpenIdProviderClientId;
use crate::strategies::{AuthCertificateStrategy, AuthHeapStrategy};
use ic_canister_sig_creation::signature_map::CanisterSigInputs;
use ic_canister_sig_creation::{delegation_signature_msg, DELEGATION_SIG_DOMAIN};
use serde_bytes::ByteBuf;

pub fn openid_get_delegation(
    args: &OpenIdGetDelegationArgs,
    client_id: &OpenIdProviderClientId,
    credential: &OpenIdCredential,
    auth_heap: &impl AuthHeapStrategy,
    certificate: &impl AuthCertificateStrategy,
) -> GetDelegationResult {
    get_delegation(
        &client_id,
        &OpenIdCredentialKey::from(credential),
        &args.session_key,
        &args.expiration,
        auth_heap,
        certificate,
    )
}

pub fn get_delegation(
    client_id: &str,
    key: &OpenIdCredentialKey,
    session_key: &SessionKey,
    expiration: &Timestamp,
    auth_heap: &impl AuthHeapStrategy,
    certificate: &impl AuthCertificateStrategy,
) -> GetDelegationResult {
    let seed = calculate_seed(client_id, key, &get_salt(auth_heap))
        .map_err(GetDelegationError::DeriveSeedFailed)?;

    let targets = delegation_targets(auth_heap);

    read_state(|state| {
        let inputs = CanisterSigInputs {
            domain: DELEGATION_SIG_DOMAIN,
            seed: &seed,
            message: &delegation_signature_msg(
                session_key,
                *expiration,
                targets_to_bytes(&targets).as_ref(),
            ),
        };

        let certified_assets_root_hash = certificate.get_asset_hashes_root_hash();

        match state
            .runtime
            .sigs
            .get_signature_as_cbor(&inputs, Some(certified_assets_root_hash))
        {
            Ok(signature) => Ok(SignedDelegation {
                delegation: Delegation {
                    pubkey: session_key.clone(),
                    expiration: *expiration,
                    targets,
                },
                signature: ByteBuf::from(signature),
            }),
            Err(_) => Err(GetDelegationError::NoSuchDelegation),
        }
    })
}
