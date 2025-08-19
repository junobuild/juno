use crate::seed::calculate_seed;
use crate::services::read_state;
use crate::types::delegation::{
    Delegation, GetDelegationArgs, GetDelegationResponse, SignedDelegation,
};
use ic_canister_sig_creation::signature_map::CanisterSigInputs;
use ic_canister_sig_creation::{delegation_signature_msg, DELEGATION_SIG_DOMAIN};
use serde_bytes::ByteBuf;

pub fn get_delegation(args: &GetDelegationArgs) -> Result<GetDelegationResponse, String> {
    let seed = calculate_seed(&args.anchor_id, &args.frontend)?;

    let response = read_state(|state| {
        let inputs = CanisterSigInputs {
            domain: DELEGATION_SIG_DOMAIN,
            seed: &seed,
            message: &delegation_signature_msg(&args.session_key, args.expiration.clone(), None),
        };

        ic_cdk::print(format!(
            "--> {} {} {:?} {}",
            args.anchor_id, args.frontend, args.session_key, args.expiration
        ));

        // TODO: maybe_certified_assets_root_hash
        match state.runtime.sigs.get_signature_as_cbor(&inputs, None) {
            Ok(signature) => GetDelegationResponse::SignedDelegation(SignedDelegation {
                delegation: Delegation {
                    pubkey: args.session_key.clone(),
                    expiration: args.expiration.clone(),
                    targets: None,
                },
                signature: ByteBuf::from(signature),
            }),
            Err(_) => GetDelegationResponse::NoSuchDelegation,
        }
    });

    Ok(response)
}
