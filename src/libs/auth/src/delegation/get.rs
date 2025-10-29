use crate::delegation::types::{
    Delegation, GetDelegationError, GetDelegationResult, SessionKey, SignedDelegation,
};
use crate::delegation::utils::duration::build_expiration;
use crate::delegation::utils::seed::calculate_seed;
use crate::delegation::utils::signature::{build_signature_inputs, build_signature_msg};
use crate::delegation::utils::targets::build_targets;
use crate::openid::types::interface::{OpenIdCredential, OpenIdCredentialKey};
use crate::state::get_salt;
use crate::state::services::read_state;
use crate::state::types::config::OpenIdProviderClientId;
use crate::strategies::{AuthCertificateStrategy, AuthHeapStrategy};
use serde_bytes::ByteBuf;

pub fn openid_get_delegation(
    session_key: &SessionKey,
    client_id: &OpenIdProviderClientId,
    credential: &OpenIdCredential,
    auth_heap: &impl AuthHeapStrategy,
    certificate: &impl AuthCertificateStrategy,
) -> GetDelegationResult {
    get_delegation(
        session_key,
        client_id,
        &OpenIdCredentialKey::from(credential),
        auth_heap,
        certificate,
    )
}

pub fn get_delegation(
    session_key: &SessionKey,
    client_id: &str,
    key: &OpenIdCredentialKey,
    auth_heap: &impl AuthHeapStrategy,
    certificate: &impl AuthCertificateStrategy,
) -> GetDelegationResult {
    let seed = calculate_seed(client_id, key, &get_salt(auth_heap))
        .map_err(GetDelegationError::DeriveSeedFailed)?;

    let expiration = build_expiration(auth_heap);

    let targets = build_targets(auth_heap);

    let message = build_signature_msg(session_key, expiration, &targets);

    let inputs = build_signature_inputs(seed.as_ref(), &message);

    let certified_assets_root_hash = certificate.get_asset_hashes_root_hash();

    read_state(|state| {
        match state
            .runtime
            .sigs
            .get_signature_as_cbor(&inputs, Some(certified_assets_root_hash))
        {
            Ok(signature) => Ok(SignedDelegation {
                delegation: Delegation {
                    pubkey: session_key.clone(),
                    expiration,
                    targets,
                },
                signature: ByteBuf::from(signature),
            }),
            Err(_) => Err(GetDelegationError::NoSuchDelegation),
        }
    })
}
