use crate::certification::strategy_impls::AuthCertificate;
use ic_cdk::trap;
use junobuild_auth::{
    delegation, GetDelegationArgs, GetDelegationResponse, PrepareDelegationArgs,
    PrepareDelegationResponse,
};

pub fn prepare_delegation(args: &PrepareDelegationArgs) -> PrepareDelegationResponse {
    delegation::prepare_delegation(args, &AuthCertificate).unwrap_or_else(|e| trap(&e))
}

pub fn get_delegation(args: &GetDelegationArgs) -> GetDelegationResponse {
    delegation::get_delegation(args, &AuthCertificate).unwrap_or_else(|e| trap(&e))
}
