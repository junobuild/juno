use crate::delegation::seed::calculate_seed;
use crate::state::services::read_state;
use crate::strategies::AuthCertificateStrategy;
use crate::types::interface::{Delegation, GetDelegationArgs, GetDelegationResponse, OpenIdGetDelegationArgs, SignedDelegation};
use ic_canister_sig_creation::signature_map::CanisterSigInputs;
use ic_canister_sig_creation::{delegation_signature_msg, DELEGATION_SIG_DOMAIN};
use serde_bytes::ByteBuf;

pub fn get_delegation(
    args: &GetDelegationArgs,
    certificate: &impl AuthCertificateStrategy,
) -> Result<GetDelegationResponse, String> {
    match args {
        GetDelegationArgs::OpenId(openid_args) => openid_get_delegation(openid_args, certificate),
        _ => Err(format!("{} is not a supported to get a delegation", args)),
    }
}

fn openid_get_delegation(args: &OpenIdGetDelegationArgs, certificate: &impl AuthCertificateStrategy,) -> Result<GetDelegationResponse, String> {
    // TODO: verify JWT

    // let seed = calculate_seed(&args.anchor_id, &args.frontend, &certificate.salt())?;
    //
    // let response = read_state(|state| {
    //     let inputs = CanisterSigInputs {
    //         domain: DELEGATION_SIG_DOMAIN,
    //         seed: &seed,
    //         message: &delegation_signature_msg(&args.session_key, args.expiration, None),
    //     };
    //
    //     let certified_assets_root_hash = certificate.get_asset_hashes_root_hash();
    //
    //     match state
    //         .runtime
    //         .sigs
    //         .get_signature_as_cbor(&inputs, Some(certified_assets_root_hash))
    //     {
    //         Ok(signature) => GetDelegationResponse::SignedDelegation(SignedDelegation {
    //             delegation: Delegation {
    //                 pubkey: args.session_key.clone(),
    //                 expiration: args.expiration,
    //                 targets: None,
    //             },
    //             signature: ByteBuf::from(signature),
    //         }),
    //         Err(_) => GetDelegationResponse::NoSuchDelegation,
    //     }
    // });
    //
    // Ok(response)

    Err("TODO".to_string())
}