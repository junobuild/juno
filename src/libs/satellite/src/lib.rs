#![doc = include_str!("../README.md")]

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
mod satellite;
mod storage;
mod types;
mod user;
mod version;

use crate::auth::types::config::AuthenticationConfig;
use crate::db::types::config::DbConfig;
use crate::guards::{caller_is_admin_controller, caller_is_controller};
use crate::types::interface::Config;
use crate::types::state::CollectionType;
use crate::version::SATELLITE_VERSION;
use ic_cdk::api::trap;
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::interface::{DelRule, SetRule};
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::core::{Blob, Key};
use junobuild_shared::types::domain::CustomDomains;
use junobuild_shared::types::interface::{
    DeleteControllersArgs, DepositCyclesArgs, MemorySize, SetControllersArgs,
};
use junobuild_shared::types::list::ListParams;
use junobuild_shared::types::list::ListResults;
use junobuild_shared::types::state::Controllers;
use junobuild_storage::http::types::{
    HttpRequest, HttpResponse, StreamingCallbackHttpResponse, StreamingCallbackToken,
};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::{
    AssetNoContent, CommitBatch, InitAssetKey, InitUploadResult, UploadChunk, UploadChunkResult,
};
use junobuild_storage::types::state::FullPath;

// ============================================================================================
// START: Re-exported Types
//
// These types are made available for use in Serverless Functions.
// ============================================================================================
pub use crate::controllers::store::{get_admin_controllers, get_controllers};
pub use crate::db::store::{
    count_collection_docs_store, count_docs_store, delete_doc_store, delete_docs_store,
    delete_filtered_docs_store, get_doc_store, list_docs_store, set_doc_store,
};
pub use crate::db::types::interface::{DelDoc, SetDoc};
pub use crate::db::types::state::Doc;
pub use crate::logs::loggers::{
    debug, debug_with_data, error, error_with_data, info, info_with_data, log, log_with_data, warn,
    warn_with_data,
};
pub use crate::logs::types::logs::{Log, LogLevel};
pub use crate::storage::handlers::set_asset_handler;
pub use crate::storage::store::{
    count_assets_store, count_collection_assets_store, delete_asset_store, delete_assets_store,
    delete_filtered_assets_store, get_asset_store, get_content_chunks_store, list_assets_store,
};
pub use crate::types::hooks::{
    AssertDeleteAssetContext, AssertDeleteDocContext, AssertSetDocContext,
    AssertUploadAssetContext, HookContext, OnDeleteAssetContext, OnDeleteDocContext,
    OnDeleteFilteredAssetsContext, OnDeleteFilteredDocsContext, OnDeleteManyAssetsContext,
    OnDeleteManyDocsContext, OnSetDocContext, OnSetManyDocsContext, OnUploadAssetContext,
};

// ============================================================================================
// END: Re-exported Types
// ============================================================================================

// ---------------------------------------------------------
// Init and Upgrade
// ---------------------------------------------------------

#[doc(hidden)]
#[init]
pub fn init() {
    satellite::init();
}

#[doc(hidden)]
#[pre_upgrade]
pub fn pre_upgrade() {
    satellite::pre_upgrade();
}

#[doc(hidden)]
#[post_upgrade]
pub fn post_upgrade() {
    satellite::post_upgrade();
}

// ---------------------------------------------------------
// Db
// ---------------------------------------------------------

#[doc(hidden)]
#[update]
pub fn set_doc(collection: CollectionKey, key: Key, doc: SetDoc) -> Doc {
    satellite::set_doc(collection, key, doc)
}

#[doc(hidden)]
#[query]
pub fn get_doc(collection: CollectionKey, key: Key) -> Option<Doc> {
    satellite::get_doc(collection, key)
}

#[doc(hidden)]
#[update]
pub fn del_doc(collection: CollectionKey, key: Key, doc: DelDoc) {
    satellite::del_doc(collection, key, doc);
}

#[doc(hidden)]
#[query]
pub fn list_docs(collection: CollectionKey, filter: ListParams) -> ListResults<Doc> {
    satellite::list_docs(collection, filter)
}

#[doc(hidden)]
#[query]
pub fn count_docs(collection: CollectionKey, filter: ListParams) -> usize {
    satellite::count_docs(collection, filter)
}

#[doc(hidden)]
#[query]
pub fn get_many_docs(docs: Vec<(CollectionKey, Key)>) -> Vec<(Key, Option<Doc>)> {
    satellite::get_many_docs(docs)
}

#[doc(hidden)]
#[update]
pub fn set_many_docs(docs: Vec<(CollectionKey, Key, SetDoc)>) -> Vec<(Key, Doc)> {
    satellite::set_many_docs(docs)
}

#[doc(hidden)]
#[update]
pub fn del_many_docs(docs: Vec<(CollectionKey, Key, DelDoc)>) {
    satellite::del_many_docs(docs)
}

#[doc(hidden)]
#[update]
pub fn del_filtered_docs(collection: CollectionKey, filter: ListParams) {
    satellite::del_filtered_docs(collection, filter)
}

#[doc(hidden)]
#[update(guard = "caller_is_controller")]
pub fn del_docs(collection: CollectionKey) {
    satellite::del_docs(collection)
}

#[doc(hidden)]
#[query(guard = "caller_is_controller")]
pub fn count_collection_docs(collection: CollectionKey) -> usize {
    satellite::count_collection_docs(collection)
}

// ---------------------------------------------------------
// Rules
// ---------------------------------------------------------

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn get_rule(collection_type: CollectionType, collection: CollectionKey) -> Option<Rule> {
    satellite::get_rule(&collection_type, &collection)
}

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn list_rules(collection_type: CollectionType) -> Vec<(CollectionKey, Rule)> {
    satellite::list_rules(collection_type)
}

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn set_rule(collection_type: CollectionType, collection: CollectionKey, rule: SetRule) -> Rule {
    satellite::set_rule(collection_type, collection, rule)
}

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn del_rule(collection_type: CollectionType, collection: CollectionKey, rule: DelRule) {
    satellite::del_rule(collection_type, collection, rule)
}

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn set_controllers(args: SetControllersArgs) -> Controllers {
    satellite::set_controllers(args)
}

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn del_controllers(args: DeleteControllersArgs) -> Controllers {
    satellite::del_controllers(args)
}

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn list_controllers() -> Controllers {
    satellite::list_controllers()
}

// ---------------------------------------------------------
// Custom domains
// ---------------------------------------------------------

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn list_custom_domains() -> CustomDomains {
    satellite::list_custom_domains()
}

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn set_custom_domain(domain_name: DomainName, bn_id: Option<String>) {
    satellite::set_custom_domain(domain_name, bn_id);
}

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn del_custom_domain(domain_name: DomainName) {
    satellite::del_custom_domain(domain_name);
}

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn get_config() -> Config {
    satellite::get_config()
}

// ---------------------------------------------------------
// Authentication config
// ---------------------------------------------------------

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn set_auth_config(config: AuthenticationConfig) {
    satellite::set_auth_config(config);
}

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn get_auth_config() -> Option<AuthenticationConfig> {
    satellite::get_auth_config()
}

// ---------------------------------------------------------
// Db config
// ---------------------------------------------------------

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn set_db_config(config: DbConfig) {
    satellite::set_db_config(config);
}

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn get_db_config() -> Option<DbConfig> {
    satellite::get_db_config()
}

// ---------------------------------------------------------
// Storage config
// ---------------------------------------------------------

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub fn set_storage_config(config: StorageConfig) {
    satellite::set_storage_config(config);
}

#[doc(hidden)]
#[query(guard = "caller_is_admin_controller")]
pub fn get_storage_config() -> StorageConfig {
    satellite::get_storage_config()
}

// ---------------------------------------------------------
// Http
// ---------------------------------------------------------

#[doc(hidden)]
#[query]
pub fn http_request(request: HttpRequest) -> HttpResponse {
    satellite::http_request(request)
}

#[doc(hidden)]
#[query]
pub fn http_request_streaming_callback(
    callback: StreamingCallbackToken,
) -> StreamingCallbackHttpResponse {
    satellite::http_request_streaming_callback(callback)
}

// ---------------------------------------------------------
// Storage
// ---------------------------------------------------------

#[doc(hidden)]
#[update]
pub fn init_asset_upload(init: InitAssetKey) -> InitUploadResult {
    satellite::init_asset_upload(init)
}

#[doc(hidden)]
#[update]
pub fn upload_asset_chunk(chunk: UploadChunk) -> UploadChunkResult {
    satellite::upload_asset_chunk(chunk)
}

#[doc(hidden)]
#[update]
pub fn commit_asset_upload(commit: CommitBatch) {
    satellite::commit_asset_upload(commit);
}

#[doc(hidden)]
#[query]
pub fn list_assets(collection: CollectionKey, filter: ListParams) -> ListResults<AssetNoContent> {
    satellite::list_assets(collection, filter)
}

#[doc(hidden)]
#[query]
pub fn count_assets(collection: CollectionKey, filter: ListParams) -> usize {
    satellite::count_assets(collection, filter)
}

#[doc(hidden)]
#[update]
pub fn del_asset(collection: CollectionKey, full_path: FullPath) {
    satellite::del_asset(collection, full_path);
}

#[doc(hidden)]
#[update]
pub fn del_many_assets(assets: Vec<(CollectionKey, String)>) {
    satellite::del_many_assets(assets);
}

#[doc(hidden)]
#[update]
pub fn del_filtered_assets(collection: CollectionKey, filter: ListParams) {
    satellite::del_filtered_assets(collection, filter)
}

#[doc(hidden)]
#[update(guard = "caller_is_controller")]
pub fn del_assets(collection: CollectionKey) {
    satellite::del_assets(collection);
}

#[doc(hidden)]
#[query(guard = "caller_is_controller")]
pub fn count_collection_assets(collection: CollectionKey) -> usize {
    satellite::count_collection_assets(collection)
}

#[doc(hidden)]
#[query]
pub fn get_asset(collection: CollectionKey, full_path: FullPath) -> Option<AssetNoContent> {
    satellite::get_asset(collection, full_path)
}

#[doc(hidden)]
#[query]
pub fn get_many_assets(
    assets: Vec<(CollectionKey, FullPath)>,
) -> Vec<(FullPath, Option<AssetNoContent>)> {
    satellite::get_many_assets(assets)
}

// ---------------------------------------------------------
// Mgmt
// ---------------------------------------------------------

#[doc(hidden)]
#[update(guard = "caller_is_admin_controller")]
pub async fn deposit_cycles(args: DepositCyclesArgs) {
    junobuild_shared::mgmt::ic::deposit_cycles(args)
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[doc(hidden)]
#[query]
pub fn version() -> String {
    SATELLITE_VERSION.to_string()
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
            commit_asset_upload, count_assets, count_collection_assets, count_collection_docs,
            count_docs, del_asset, del_assets, del_controllers, del_custom_domain, del_doc,
            del_docs, del_filtered_assets, del_filtered_docs, del_many_assets, del_many_docs,
            del_rule, deposit_cycles, get_asset, get_auth_config, get_config, get_db_config,
            get_doc, get_many_assets, get_many_docs, get_storage_config, http_request,
            http_request_streaming_callback, init, init_asset_upload, list_assets,
            list_controllers, list_custom_domains, list_docs, list_rules, memory_size,
            post_upgrade, pre_upgrade, set_auth_config, set_controllers, set_custom_domain,
            set_db_config, set_doc, set_many_docs, set_rule, set_storage_config,
            upload_asset_chunk, version,
        };

        #[ic_cdk::query]
        pub fn build_version() -> String {
            env!("CARGO_PKG_VERSION").to_string()
        }

        ic_cdk::export_candid!();
    };
}
