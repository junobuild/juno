#![doc = include_str!("../README.md")]

mod api;
mod assets;
mod auth;
mod controllers;
mod db;
mod errors;
mod guards;
mod hooks;
mod impls;
mod logs;
mod memory;
mod random;
mod rules;
mod sdk;
mod types;
mod user;

use crate::auth::types::config::AuthenticationConfig;
use crate::db::types::config::DbConfig;
use crate::guards::{
    caller_is_admin_controller, caller_is_controller, caller_is_controller_with_write,
};
use crate::types::interface::{Config, DeleteProposalAssets};
use crate::types::state::CollectionType;
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use junobuild_cdn::proposals::{
    CommitProposal, ListProposalResults, ListProposalsParams, Proposal, ProposalId, ProposalType,
    RejectProposal,
};
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::interface::{
    DelRule, ListRulesParams, ListRulesResults, SetRule,
};
use junobuild_collections::types::rules::Rule;
use junobuild_shared::ic::call::ManualReply;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::core::Key;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_shared::types::interface::{
    DeleteControllersArgs, DepositCyclesArgs, InitSatelliteArgs, MemorySize, SetControllersArgs,
};
use junobuild_shared::types::list::ListParams;
use junobuild_shared::types::list::ListResults;
use junobuild_shared::types::state::Controllers;
use junobuild_storage::http::types::{
    HttpRequest, HttpResponse, StreamingCallbackHttpResponse, StreamingCallbackToken,
};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::{
    AssetNoContent, CommitBatch, InitAssetKey, InitUploadResult, SetStorageConfig, UploadChunk,
    UploadChunkResult,
};
use junobuild_storage::types::state::FullPath;
use memory::lifecycle;

// ============================================================================================
// These types are made available for use in Serverless Functions.
// ============================================================================================
use crate::auth::types::interface::SetAuthenticationConfig;
use crate::db::types::interface::SetDbConfig;
pub use sdk::core::*;
pub use sdk::internal;

// ---------------------------------------------------------
// Init and Upgrade
// ---------------------------------------------------------

#[doc(hidden)]
#[init]
pub fn init(args: InitSatelliteArgs) {
    lifecycle::init(args);
}

#[doc(hidden)]
#[pre_upgrade]
pub fn pre_upgrade() {
    lifecycle::pre_upgrade();
}

#[doc(hidden)]
#[post_upgrade]
pub fn post_upgrade() {
    lifecycle::post_upgrade();
}

// ---------------------------------------------------------
// Db
// ---------------------------------------------------------

#[doc(hidden)]
#[update]
pub fn set_doc(collection: CollectionKey, key: Key, doc: SetDoc) -> Doc {
    api::db::set_doc(collection, key, doc)
}

#[doc(hidden)]
#[query]
pub fn get_doc(collection: CollectionKey, key: Key) -> Option<Doc> {
    api::db::get_doc(collection, key)
}

#[doc(hidden)]
#[update]
pub fn del_doc(collection: CollectionKey, key: Key, doc: DelDoc) {
    api::db::del_doc(collection, key, doc);
}

#[doc(hidden)]
#[query]
pub fn list_docs(collection: CollectionKey, filter: ListParams) -> ListResults<Doc> {
    api::db::list_docs(collection, filter)
}

#[doc(hidden)]
#[query]
pub fn count_docs(collection: CollectionKey, filter: ListParams) -> usize {
    api::db::count_docs(collection, filter)
}

#[doc(hidden)]
#[query]
pub fn get_many_docs(docs: Vec<(CollectionKey, Key)>) -> Vec<(Key, Option<Doc>)> {
    api::db::get_many_docs(docs)
}

#[doc(hidden)]
#[update]
pub fn set_many_docs(docs: Vec<(CollectionKey, Key, SetDoc)>) -> Vec<(Key, Doc)> {
    api::db::set_many_docs(docs)
}

#[doc(hidden)]
#[update]
pub fn del_many_docs(docs: Vec<(CollectionKey, Key, DelDoc)>) {
    api::db::del_many_docs(docs)
}

#[doc(hidden)]
#[update]
pub fn del_filtered_docs(collection: CollectionKey, filter: ListParams) {
    api::db::del_filtered_docs(collection, filter)
}

#[doc(hidden)]
#[update(guard = "caller_is_controller_with_write")]
pub fn del_docs(collection: CollectionKey) {
    api::db::del_docs(collection)
}

#[doc(hidden)]
#[query(guard = "caller_is_controller_with_write")]
pub fn count_collection_docs(collection: CollectionKey) -> usize {
    api::db::count_collection_docs(collection)
}

// ---------------------------------------------------------
// Rules
// ---------------------------------------------------------

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn get_rule(collection_type: CollectionType, collection: CollectionKey) -> Option<Rule> {
    api::rules::get_rule(&collection_type, &collection)
}

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn list_rules(collection_type: CollectionType, filter: ListRulesParams) -> ListRulesResults {
    api::rules::list_rules(&collection_type, &filter)
}

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn set_rule(collection_type: CollectionType, collection: CollectionKey, rule: SetRule) -> Rule {
    api::rules::set_rule(collection_type, collection, rule)
}

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn del_rule(collection_type: CollectionType, collection: CollectionKey, rule: DelRule) {
    api::rules::del_rule(collection_type, collection, rule)
}

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn switch_storage_system_memory() {
    api::rules::switch_storage_system_memory()
}

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn set_controllers(args: SetControllersArgs) -> Controllers {
    api::controllers::set_controllers(args)
}

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn del_controllers(args: DeleteControllersArgs) -> Controllers {
    api::controllers::del_controllers(args)
}

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn list_controllers() -> Controllers {
    api::controllers::list_controllers()
}

// ---------------------------------------------------------
// Proposal
// ---------------------------------------------------------

#[doc(hidden)]
#[query(guard = "caller_is_controller")]
pub fn get_proposal(proposal_id: ProposalId) -> Option<Proposal> {
    api::cdn::get_proposal(&proposal_id)
}

#[doc(hidden)]
#[query(guard = "caller_is_controller")]
pub fn list_proposals(filter: ListProposalsParams) -> ListProposalResults {
    api::cdn::list_proposals(&filter)
}

#[doc(hidden)]
#[query(guard = "caller_is_controller")]
pub fn count_proposals() -> usize {
    api::cdn::count_proposals()
}

#[doc(hidden)]
#[update(guard = "caller_is_controller")]
pub fn init_proposal(proposal_type: ProposalType) -> (ProposalId, Proposal) {
    api::cdn::init_proposal(&proposal_type)
}

#[doc(hidden)]
#[update(guard = "caller_is_controller")]
pub fn submit_proposal(proposal_id: ProposalId) -> (ProposalId, Proposal) {
    api::cdn::submit_proposal(&proposal_id)
}

#[doc(hidden)]
#[update(guard = "caller_is_controller_with_write", manual_reply = true)]
pub fn reject_proposal(proposal: RejectProposal) -> ManualReply<()> {
    api::cdn::reject_proposal(&proposal)
}

#[doc(hidden)]
#[update(guard = "caller_is_controller_with_write", manual_reply = true)]
pub fn commit_proposal(proposal: CommitProposal) -> ManualReply<()> {
    api::cdn::commit_proposal(&proposal)
}

#[doc(hidden)]
#[update(guard = "caller_is_controller_with_write")]
pub fn delete_proposal_assets(params: DeleteProposalAssets) {
    api::cdn::delete_proposal_assets(&params)
}

// ---------------------------------------------------------
// Internal storage
// ---------------------------------------------------------

#[doc(hidden)]
#[deprecated(note = "Use init_proposal_many_assets_upload instead")]
#[update(guard = "caller_is_controller")]
pub fn init_proposal_asset_upload(init: InitAssetKey, proposal_id: ProposalId) -> InitUploadResult {
    api::cdn::init_proposal_asset_upload(init, proposal_id)
}

#[doc(hidden)]
#[update(guard = "caller_is_controller")]
pub fn init_proposal_many_assets_upload(
    init_asset_keys: Vec<InitAssetKey>,
    proposal_id: ProposalId,
) -> Vec<(FullPath, InitUploadResult)> {
    api::cdn::init_proposal_many_assets_upload(init_asset_keys, proposal_id)
}

#[doc(hidden)]
#[update(guard = "caller_is_controller")]
pub fn upload_proposal_asset_chunk(chunk: UploadChunk) -> UploadChunkResult {
    api::cdn::upload_proposal_asset_chunk(chunk)
}

#[doc(hidden)]
#[deprecated(note = "Use commit_proposal_many_assets_upload instead")]
#[update(guard = "caller_is_controller")]
pub fn commit_proposal_asset_upload(commit: CommitBatch) {
    api::cdn::commit_proposal_asset_upload(commit)
}

#[doc(hidden)]
#[update(guard = "caller_is_controller")]
pub fn commit_proposal_many_assets_upload(commits: Vec<CommitBatch>) {
    api::cdn::commit_proposal_many_assets_upload(commits)
}

// ---------------------------------------------------------
// Custom domains
// ---------------------------------------------------------

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn list_custom_domains() -> CustomDomains {
    api::cdn::list_custom_domains()
}

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn set_custom_domain(domain_name: DomainName, bn_id: Option<String>) {
    api::cdn::set_custom_domain(domain_name, bn_id);
}

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn del_custom_domain(domain_name: DomainName) {
    api::cdn::del_custom_domain(domain_name);
}

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn get_config() -> Config {
    api::config::get_config()
}

// ---------------------------------------------------------
// Authentication config
// ---------------------------------------------------------

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn set_auth_config(config: SetAuthenticationConfig) -> AuthenticationConfig {
    api::config::set_auth_config(config)
}

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn get_auth_config() -> Option<AuthenticationConfig> {
    api::config::get_auth_config()
}

// ---------------------------------------------------------
// Db config
// ---------------------------------------------------------

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn set_db_config(config: SetDbConfig) -> DbConfig {
    api::config::set_db_config(config)
}

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn get_db_config() -> Option<DbConfig> {
    api::config::get_db_config()
}

// ---------------------------------------------------------
// Storage config
// ---------------------------------------------------------

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn set_storage_config(config: SetStorageConfig) -> StorageConfig {
    api::config::set_storage_config(config)
}

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn get_storage_config() -> StorageConfig {
    api::config::get_storage_config()
}

// ---------------------------------------------------------
// Http
// ---------------------------------------------------------

#[doc(hidden)]
#[query]
pub fn http_request(request: HttpRequest) -> HttpResponse {
    api::http::http_request(request)
}

#[doc(hidden)]
#[query]
pub fn http_request_streaming_callback(
    callback: StreamingCallbackToken,
) -> StreamingCallbackHttpResponse {
    api::http::http_request_streaming_callback(callback)
}

// ---------------------------------------------------------
// Storage
// ---------------------------------------------------------

#[doc(hidden)]
#[update]
pub fn init_asset_upload(init: InitAssetKey) -> InitUploadResult {
    api::storage::init_asset_upload(init)
}

#[doc(hidden)]
#[update]
pub fn upload_asset_chunk(chunk: UploadChunk) -> UploadChunkResult {
    api::storage::upload_asset_chunk(chunk)
}

#[doc(hidden)]
#[update]
pub fn commit_asset_upload(commit: CommitBatch) {
    api::storage::commit_asset_upload(commit);
}

#[doc(hidden)]
#[query]
pub fn list_assets(collection: CollectionKey, filter: ListParams) -> ListResults<AssetNoContent> {
    api::storage::list_assets(collection, filter)
}

#[doc(hidden)]
#[query]
pub fn count_assets(collection: CollectionKey, filter: ListParams) -> usize {
    api::storage::count_assets(collection, filter)
}

#[doc(hidden)]
#[update]
pub fn del_asset(collection: CollectionKey, full_path: FullPath) {
    api::storage::del_asset(collection, full_path);
}

#[doc(hidden)]
#[update]
pub fn del_many_assets(assets: Vec<(CollectionKey, String)>) {
    api::storage::del_many_assets(assets);
}

#[doc(hidden)]
#[update]
pub fn del_filtered_assets(collection: CollectionKey, filter: ListParams) {
    api::storage::del_filtered_assets(collection, filter)
}

#[doc(hidden)]
#[update(guard = "caller_is_controller_with_write")]
pub fn del_assets(collection: CollectionKey) {
    api::storage::del_assets(collection);
}

#[doc(hidden)]
#[query(guard = "caller_is_controller_with_write")]
pub fn count_collection_assets(collection: CollectionKey) -> usize {
    api::storage::count_collection_assets(collection)
}

#[doc(hidden)]
#[query]
pub fn get_asset(collection: CollectionKey, full_path: FullPath) -> Option<AssetNoContent> {
    api::storage::get_asset(collection, full_path)
}

#[doc(hidden)]
#[query]
pub fn get_many_assets(
    assets: Vec<(CollectionKey, FullPath)>,
) -> Vec<(FullPath, Option<AssetNoContent>)> {
    api::storage::get_many_assets(assets)
}

// ---------------------------------------------------------
// Mgmt
// ---------------------------------------------------------

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub async fn deposit_cycles(args: DepositCyclesArgs) {
    junobuild_shared::mgmt::ic::deposit_cycles(args)
        .await
        .unwrap_or_trap()
}

#[doc(hidden)]
#[query(guard = "caller_is_controller")]
pub fn memory_size() -> MemorySize {
    junobuild_shared::canister::memory_size()
}

/// Include the stock Juno satellite features into your Juno application.
///
/// The `include_satellite!` macro allows you to easily import and use all the essential features and
/// functionalities provided by the Juno satellite crate (`junobuild_satellite`). These features include
/// various functions and utilities for managing documents, assets, controllers, rules, custom domains,
/// and more, effectively supercharging the functionality of your Juno dapp.
///
/// Example:
/// ```rust
/// use junobuild_satellite::include_satellite;
///
/// // Include Juno satellite features
/// include_satellite!();
/// ```
///
#[macro_export]
macro_rules! include_satellite {
    () => {
        use junobuild_satellite::{
            commit_asset_upload, commit_proposal, commit_proposal_asset_upload,
            commit_proposal_many_assets_upload, count_assets, count_collection_assets,
            count_collection_docs, count_docs, count_proposals, del_asset, del_assets,
            del_controllers, del_custom_domain, del_doc, del_docs, del_filtered_assets,
            del_filtered_docs, del_many_assets, del_many_docs, del_rule, delete_proposal_assets,
            deposit_cycles, get_asset, get_auth_config, get_config, get_db_config, get_doc,
            get_many_assets, get_many_docs, get_proposal, get_storage_config, http_request,
            http_request_streaming_callback, init, init_asset_upload, init_proposal,
            init_proposal_asset_upload, init_proposal_many_assets_upload, list_assets,
            list_controllers, list_custom_domains, list_docs, list_proposals, list_rules,
            post_upgrade, pre_upgrade, reject_proposal, set_auth_config, set_controllers,
            set_custom_domain, set_db_config, set_doc, set_many_docs, set_rule, set_storage_config,
            submit_proposal, switch_storage_system_memory, upload_asset_chunk,
            upload_proposal_asset_chunk,
        };

        ic_cdk::export_candid!();
    };
}
