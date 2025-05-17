use crate::storage::state::heap::{
    delete_domain, get_config, get_domain, get_domains, insert_domain,
};
use crate::store::heap::get_controllers;
use crate::store::stable::get_proposal;
use crate::strategies_impls::storage::StorageState;
use candid::Principal;
use junobuild_cdn::proposals::ProposalId;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_storage::store::create_batch;
use junobuild_storage::types::interface::InitAssetKey;
use junobuild_storage::types::runtime_state::BatchId;
use junobuild_storage::well_known::update::update_custom_domains_asset;
use junobuild_storage::well_known::utils::build_custom_domain;
use regex::Regex;

pub fn init_asset_upload(
    caller: Principal,
    init: InitAssetKey,
    proposal_id: ProposalId,
) -> Result<BatchId, String> {
    let proposal = get_proposal(&proposal_id);

    if proposal.is_none() {
        return Err(format!("No proposal found for {}", proposal_id));
    }

    assert_releases_keys(&init)?;

    let controllers = get_controllers();
    let config = get_config();

    create_batch(
        caller,
        &controllers,
        &config,
        init,
        Some(proposal_id),
        &StorageState,
    )
}

fn assert_releases_keys(InitAssetKey { full_path, .. }: &InitAssetKey) -> Result<(), String> {
    if full_path == "/releases/metadata.json" {
        return Err(format!("{} is a reserved asset.", full_path).to_string());
    }

    if full_path.starts_with("/releases/satellite")
        || full_path.starts_with("/releases/mission_control")
        || full_path.starts_with("/releases/orbiter")
    {
        let re =
            Regex::new(r"^/releases/(satellite|mission_control|orbiter)-v\d+\.\d+\.\d+\.wasm\.gz$")
                .unwrap();

        return if re.is_match(full_path) {
            Ok(())
        } else {
            Err(format!(
                "{} does not match the required pattern.",
                full_path
            ))
        };
    }

    Ok(())
}

// ---------------------------------------------------------
// Domain
// ---------------------------------------------------------

// TODO: following functions are really similar to those of the satellite, maybe some day we can refactor those.

pub fn get_custom_domains_store() -> CustomDomains {
    get_domains()
}

pub fn set_domain_store(domain_name: &DomainName, bn_id: &Option<String>) -> Result<(), String> {
    set_domain_impl(domain_name, bn_id)
}

pub fn delete_domain_store(domain_name: &DomainName) -> Result<(), String> {
    delete_domain_impl(domain_name)
}

fn delete_domain_impl(domain_name: &DomainName) -> Result<(), String> {
    delete_domain(domain_name);

    update_custom_domains_asset(&StorageState)
}

fn set_domain_impl(domain_name: &DomainName, bn_id: &Option<String>) -> Result<(), String> {
    set_state_domain_impl(domain_name, bn_id);

    update_custom_domains_asset(&StorageState)
}

fn set_state_domain_impl(domain_name: &DomainName, bn_id: &Option<String>) {
    let domain = get_domain(domain_name);

    let custom_domain = build_custom_domain(domain, bn_id);

    insert_domain(domain_name, &custom_domain);
}
