use crate::auth::store::{
    get_config as get_authentication_config, set_config as set_authentication_config,
};
use crate::auth::types::config::AuthenticationConfig;
use crate::controllers::store::get_admin_controllers;
use crate::controllers::store::{
    delete_controllers as delete_controllers_store, get_controllers,
    set_controllers as set_controllers_store,
};
use crate::db::store::{
    count_collection_docs_store, count_docs_store, delete_doc_store, delete_docs_store,
    delete_filtered_docs_store, get_config_store as get_db_config_store, get_doc_store,
    list_docs_store, set_config_store as set_db_config_store, set_doc_store,
};
use crate::db::types::config::DbConfig;
use crate::db::types::interface::{DelDoc, SetDoc};
use crate::db::types::state::{Doc, DocContext, DocUpsert};
use crate::hooks::{
    invoke_on_delete_asset, invoke_on_delete_doc, invoke_on_delete_filtered_assets,
    invoke_on_delete_filtered_docs, invoke_on_delete_many_assets, invoke_on_delete_many_docs,
    invoke_on_init, invoke_on_post_upgrade, invoke_on_set_doc, invoke_on_set_many_docs,
    invoke_upload_asset,
};
use crate::memory::{get_memory_upgrades, init_stable_state, STATE};
use crate::random::defer_init_random_seed;
use crate::rules::store::{
    del_rule_db, del_rule_storage, get_rule_db, get_rule_storage, get_rules_db, get_rules_storage,
    set_rule_db, set_rule_storage,
};
use crate::storage::certified_assets::upgrade::defer_init_certified_assets;
use crate::storage::store::{
    commit_batch_store, count_assets_store, count_collection_assets_store, create_batch_store,
    create_chunk_store, delete_asset_store, delete_assets_store, delete_domain_store,
    delete_filtered_assets_store, get_asset_store, get_config_store as get_storage_config_store,
    get_custom_domains_store, list_assets_store, set_config_store as set_storage_config_store,
    set_domain_store,
};
use crate::storage::strategy_impls::StorageState;
use crate::types::interface::Config;
use crate::types::state::{CollectionType, HeapState, RuntimeState, State};
use ciborium::{from_reader, into_writer};
use ic_cdk::api::call::{arg_data, ArgDecoderConfig};
use ic_cdk::api::{caller, trap};
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::interface::{DelRule, SetRule};
use junobuild_collections::types::rules::Rule;
use junobuild_shared::constants_shared::MAX_NUMBER_OF_SATELLITE_CONTROLLERS;
use junobuild_shared::controllers::{
    assert_controllers, assert_max_number_of_controllers, init_controllers,
};
use junobuild_shared::types::core::{DomainName, Key};
use junobuild_shared::types::domain::CustomDomains;
use junobuild_shared::types::interface::{DeleteControllersArgs, SegmentArgs, SetControllersArgs};
use junobuild_shared::types::list::ListParams;
use junobuild_shared::types::list::ListResults;
use junobuild_shared::types::memory::Memory;
use junobuild_shared::types::state::{ControllerScope, Controllers};
use junobuild_shared::upgrade::{read_post_upgrade, write_pre_upgrade};
use junobuild_storage::http::types::{
    HttpRequest, HttpResponse, StreamingCallbackHttpResponse, StreamingCallbackToken,
};
use junobuild_storage::http_request::{
    http_request as http_request_storage,
    http_request_streaming_callback as http_request_streaming_callback_storage,
};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::{
    AssetNoContent, CommitBatch, InitAssetKey, InitUploadResult, UploadChunk, UploadChunkResult,
};
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::Asset;
use crate::rules::upgrade::init_new_user_collections;

pub fn init() {
    let call_arg = arg_data::<(Option<SegmentArgs>,)>(ArgDecoderConfig::default()).0;
    let SegmentArgs { controllers } = call_arg.unwrap();

    let heap = HeapState {
        controllers: init_controllers(&controllers),
        ..HeapState::default()
    };

    STATE.with(|state| {
        *state.borrow_mut() = State {
            stable: init_stable_state(),
            heap,
            runtime: RuntimeState::default(),
        };
    });

    invoke_on_init();
}

pub fn pre_upgrade() {
    let mut state_bytes = vec![];
    STATE
        .with(|s| into_writer(&*s.borrow(), &mut state_bytes))
        .expect("Failed to encode the state of the satellite in pre_upgrade hook.");

    write_pre_upgrade(&state_bytes, &mut get_memory_upgrades());
}

pub fn post_upgrade() {
    let memory: Memory = get_memory_upgrades();
    let state_bytes = read_post_upgrade(&memory);

    let state = from_reader(&*state_bytes)
        .expect("Failed to decode the state of the satellite in post_upgrade hook.");
    STATE.with(|s| *s.borrow_mut() = state);

    defer_init_certified_assets();
    defer_init_random_seed();

    invoke_on_post_upgrade();

    // TODO: to be removed - one time upgrade!
    init_new_user_collections();
}

// ---------------------------------------------------------
// Db
// ---------------------------------------------------------

pub fn set_doc(collection: CollectionKey, key: Key, doc: SetDoc) -> Doc {
    let caller = caller();

    let result = set_doc_store(caller, collection, key, doc);

    match result {
        Ok(doc) => {
            invoke_on_set_doc(&caller, &doc);

            doc.data.after
        }
        Err(error) => trap(&error),
    }
}

pub fn get_doc(collection: CollectionKey, key: Key) -> Option<Doc> {
    let caller = caller();

    let result = get_doc_store(caller, collection, key);

    match result {
        Ok(value) => value,
        Err(error) => trap(&error),
    }
}

pub fn del_doc(collection: CollectionKey, key: Key, doc: DelDoc) {
    let caller = caller();

    let deleted_doc = delete_doc_store(caller, collection, key, doc).unwrap_or_else(|e| trap(&e));

    invoke_on_delete_doc(&caller, &deleted_doc);
}

pub fn list_docs(collection: CollectionKey, filter: ListParams) -> ListResults<Doc> {
    let caller = caller();

    let result = list_docs_store(caller, collection, &filter);

    match result {
        Ok(value) => value,
        Err(error) => trap(&error),
    }
}

pub fn count_docs(collection: CollectionKey, filter: ListParams) -> usize {
    let caller = caller();

    let result = count_docs_store(caller, collection, &filter);

    match result {
        Ok(value) => value,
        Err(error) => trap(&error),
    }
}

pub fn get_many_docs(docs: Vec<(CollectionKey, Key)>) -> Vec<(Key, Option<Doc>)> {
    docs.iter()
        .map(|(collection, key)| {
            let doc = get_doc(collection.clone(), key.clone());
            (key.clone(), doc.clone())
        })
        .collect()
}

pub fn set_many_docs(docs: Vec<(CollectionKey, Key, SetDoc)>) -> Vec<(Key, Doc)> {
    let caller = caller();

    let mut hook_payload: Vec<DocContext<DocUpsert>> = Vec::new();
    let mut results: Vec<(Key, Doc)> = Vec::new();

    for (collection, key, doc) in docs {
        let result =
            set_doc_store(caller, collection, key.clone(), doc).unwrap_or_else(|e| trap(&e));

        results.push((result.key.clone(), result.data.after.clone()));

        hook_payload.push(result);
    }

    invoke_on_set_many_docs(&caller, &hook_payload);

    results
}

pub fn del_many_docs(docs: Vec<(CollectionKey, Key, DelDoc)>) {
    let caller = caller();

    let mut results: Vec<DocContext<Option<Doc>>> = Vec::new();

    for (collection, key, doc) in docs {
        let deleted_doc =
            delete_doc_store(caller, collection, key.clone(), doc).unwrap_or_else(|e| trap(&e));
        results.push(deleted_doc);
    }

    invoke_on_delete_many_docs(&caller, &results);
}

pub fn del_filtered_docs(collection: CollectionKey, filter: ListParams) {
    let caller = caller();

    let results =
        delete_filtered_docs_store(caller, collection, &filter).unwrap_or_else(|e| trap(&e));

    invoke_on_delete_filtered_docs(&caller, &results);
}

pub fn del_docs(collection: CollectionKey) {
    let _ = delete_docs_store(&collection).unwrap_or_else(|e| trap(&e));
}

pub fn count_collection_docs(collection: CollectionKey) -> usize {
    let result = count_collection_docs_store(&collection);

    match result {
        Ok(value) => value,
        Err(error) => trap(&error),
    }
}

// ---------------------------------------------------------
// Rules
// ---------------------------------------------------------

pub fn get_rule(collection_type: &CollectionType, collection: &CollectionKey) -> Option<Rule> {
    match collection_type {
        CollectionType::Db => get_rule_db(collection),
        CollectionType::Storage => get_rule_storage(collection),
    }
}

pub fn list_rules(collection_type: CollectionType) -> Vec<(CollectionKey, Rule)> {
    match collection_type {
        CollectionType::Db => get_rules_db(),
        CollectionType::Storage => get_rules_storage(),
    }
}

pub fn set_rule(collection_type: CollectionType, collection: CollectionKey, rule: SetRule) -> Rule {
    match collection_type {
        CollectionType::Db => set_rule_db(collection, rule).unwrap_or_else(|e| trap(&e)),
        CollectionType::Storage => set_rule_storage(collection, rule).unwrap_or_else(|e| trap(&e)),
    }
}

pub fn del_rule(collection_type: CollectionType, collection: CollectionKey, rule: DelRule) {
    match collection_type {
        CollectionType::Db => del_rule_db(collection, rule).unwrap_or_else(|e| trap(&e)),
        CollectionType::Storage => del_rule_storage(collection, rule).unwrap_or_else(|e| trap(&e)),
    }
}

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

pub fn set_controllers(
    SetControllersArgs {
        controllers,
        controller,
    }: SetControllersArgs,
) -> Controllers {
    match controller.scope {
        ControllerScope::Write => {}
        ControllerScope::Admin => {
            let max_controllers = assert_max_number_of_controllers(
                &get_admin_controllers(),
                &controllers,
                MAX_NUMBER_OF_SATELLITE_CONTROLLERS,
            );

            if let Err(err) = max_controllers {
                trap(&err)
            }
        }
    }

    assert_controllers(&controllers).unwrap_or_else(|e| trap(&e));

    set_controllers_store(&controllers, &controller);
    get_controllers()
}

pub fn del_controllers(
    DeleteControllersArgs { controllers }: DeleteControllersArgs,
) -> Controllers {
    delete_controllers_store(&controllers);
    get_controllers()
}

pub fn list_controllers() -> Controllers {
    get_controllers()
}

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn get_config() -> Config {
    let storage = get_storage_config_store();
    let db = get_db_config_store();
    let authentication = get_authentication_config();

    Config {
        storage,
        db,
        authentication,
    }
}

// ---------------------------------------------------------
// Custom domains
// ---------------------------------------------------------

pub fn list_custom_domains() -> CustomDomains {
    get_custom_domains_store()
}

pub fn set_custom_domain(domain_name: DomainName, bn_id: Option<String>) {
    set_domain_store(&domain_name, &bn_id).unwrap_or_else(|e| trap(&e));
}

pub fn del_custom_domain(domain_name: DomainName) {
    delete_domain_store(&domain_name).unwrap_or_else(|e| trap(&e));
}

// ---------------------------------------------------------
// Authentication config
// ---------------------------------------------------------

pub fn set_auth_config(config: AuthenticationConfig) {
    set_authentication_config(&config).unwrap_or_else(|e| trap(&e));
}

pub fn get_auth_config() -> Option<AuthenticationConfig> {
    get_authentication_config()
}

// ---------------------------------------------------------
// Db config
// ---------------------------------------------------------

pub fn set_db_config(config: DbConfig) {
    set_db_config_store(&config);
}

pub fn get_db_config() -> Option<DbConfig> {
    get_db_config_store()
}

// ---------------------------------------------------------
// Storage config
// ---------------------------------------------------------

pub fn set_storage_config(config: StorageConfig) {
    set_storage_config_store(&config);
}

pub fn get_storage_config() -> StorageConfig {
    get_storage_config_store()
}

// ---------------------------------------------------------
// Http
// ---------------------------------------------------------

pub fn http_request(request: HttpRequest) -> HttpResponse {
    http_request_storage(request, &StorageState)
}

pub fn http_request_streaming_callback(
    streaming_callback_token: StreamingCallbackToken,
) -> StreamingCallbackHttpResponse {
    http_request_streaming_callback_storage(streaming_callback_token, &StorageState)
}

// ---------------------------------------------------------
// Storage
// ---------------------------------------------------------

pub fn init_asset_upload(init: InitAssetKey) -> InitUploadResult {
    let caller = caller();
    let result = create_batch_store(caller, init);

    match result {
        Ok(batch_id) => InitUploadResult { batch_id },
        Err(error) => trap(&error),
    }
}

pub fn upload_asset_chunk(chunk: UploadChunk) -> UploadChunkResult {
    let caller = caller();

    let result = create_chunk_store(caller, chunk);

    match result {
        Ok(chunk_id) => UploadChunkResult { chunk_id },
        Err(error) => trap(&error),
    }
}

pub fn commit_asset_upload(commit: CommitBatch) {
    let caller = caller();

    let asset = commit_batch_store(caller, commit).unwrap_or_else(|e| trap(&e));

    invoke_upload_asset(&caller, &asset);
}

pub fn list_assets(collection: CollectionKey, filter: ListParams) -> ListResults<AssetNoContent> {
    let caller = caller();

    let result = list_assets_store(caller, &collection, &filter);

    match result {
        Ok(result) => result,
        Err(error) => trap(&error),
    }
}

pub fn count_assets(collection: CollectionKey, filter: ListParams) -> usize {
    let caller = caller();

    let result = count_assets_store(caller, &collection, &filter);

    match result {
        Ok(result) => result,
        Err(error) => trap(&error),
    }
}

pub fn del_asset(collection: CollectionKey, full_path: FullPath) {
    let caller = caller();

    let result = delete_asset_store(caller, &collection, full_path);

    match result {
        Ok(asset) => invoke_on_delete_asset(&caller, &asset),
        Err(error) => trap(&error),
    }
}

pub fn del_many_assets(assets: Vec<(CollectionKey, String)>) {
    let caller = caller();

    let mut results: Vec<Option<Asset>> = Vec::new();

    for (collection, full_path) in assets {
        let deleted_asset =
            delete_asset_store(caller, &collection, full_path).unwrap_or_else(|e| trap(&e));
        results.push(deleted_asset);
    }

    invoke_on_delete_many_assets(&caller, &results);
}

pub fn del_filtered_assets(collection: CollectionKey, filter: ListParams) {
    let caller = caller();

    let results =
        delete_filtered_assets_store(caller, collection, &filter).unwrap_or_else(|e| trap(&e));

    invoke_on_delete_filtered_assets(&caller, &results);
}

pub fn del_assets(collection: CollectionKey) {
    let result = delete_assets_store(&collection);

    match result {
        Ok(_) => (),
        Err(error) => trap(&error),
    }
}

pub fn count_collection_assets(collection: CollectionKey) -> usize {
    let result = count_collection_assets_store(&collection);

    match result {
        Ok(value) => value,
        Err(error) => trap(&error),
    }
}

pub fn get_asset(collection: CollectionKey, full_path: FullPath) -> Option<AssetNoContent> {
    let caller = caller();

    let result = get_asset_store(caller, &collection, full_path);

    match result {
        Ok(asset) => asset.map(|asset| AssetNoContent::from(&asset)),
        Err(error) => trap(&error),
    }
}

pub fn get_many_assets(
    assets: Vec<(CollectionKey, FullPath)>,
) -> Vec<(FullPath, Option<AssetNoContent>)> {
    assets
        .iter()
        .map(|(collection, full_path)| {
            let asset = get_asset(collection.clone(), full_path.clone());
            (full_path.clone(), asset.clone())
        })
        .collect()
}
