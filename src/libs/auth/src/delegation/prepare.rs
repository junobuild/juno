use crate::constants::DEFAULT_EXPIRATION_PERIOD_NS;
use crate::seed::calculate_seed;
use crate::services::mutate_state;
use crate::types::interface::{PrepareDelegationArgs, PublicKey, Timestamp, UserKey};
use crate::types::runtime_state::State;
use ic_canister_sig_creation::signature_map::CanisterSigInputs;
use ic_canister_sig_creation::{
    delegation_signature_msg, CanisterSigPublicKey, DELEGATION_SIG_DOMAIN,
};
use ic_cdk::api::{canister_self, time};
use serde_bytes::ByteBuf;
use crate::strategies::AuthCertificateStrategy;

pub fn prepare_delegation(args: &PrepareDelegationArgs, certificate: &impl AuthCertificateStrategy) -> Result<(UserKey, Timestamp), String> {
    let expiration = time().saturating_add(DEFAULT_EXPIRATION_PERIOD_NS);
    let seed = calculate_seed(&args.anchor_id, &args.frontend)?;

    ic_cdk::print(format!(
        "__> {} {} {:?}",
        args.anchor_id, args.frontend, args.session_key
    ));

    mutate_state(|state| {
        add_delegation_signature(state, &args.session_key, seed.as_ref(), expiration);
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
