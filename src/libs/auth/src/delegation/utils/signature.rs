use crate::delegation::types::{DelegationTargets, SessionKey, Timestamp};
use crate::delegation::utils::targets::targets_to_bytes;
use ic_canister_sig_creation::signature_map::CanisterSigInputs;
use ic_canister_sig_creation::{delegation_signature_msg, DELEGATION_SIG_DOMAIN};

pub fn build_signature_inputs<'a>(seed: &'a [u8], message: &'a [u8]) -> CanisterSigInputs<'a> {
    CanisterSigInputs {
        domain: DELEGATION_SIG_DOMAIN,
        seed,
        message,
    }
}

pub fn build_signature_msg(
    session_key: &SessionKey,
    expiration: Timestamp,
    targets: &Option<DelegationTargets>,
) -> Vec<u8> {
    delegation_signature_msg(session_key, expiration, targets_to_bytes(targets).as_ref())
}
