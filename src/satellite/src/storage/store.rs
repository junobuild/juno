use crate::assert::assert_description_length;
use crate::list::utils::list_values;
use crate::memory::STATE;
use crate::msg::{
    COLLECTION_NOT_EMPTY, COLLECTION_NOT_FOUND, COLLECTION_READ_RULE_MISSING,
    COLLECTION_WRITE_RULE_MISSING, ERROR_ASSET_NOT_FOUND, ERROR_CANNOT_COMMIT_BATCH,
    UPLOAD_NOT_ALLOWED,
};
use crate::rules::constants::DEFAULT_ASSETS_COLLECTIONS;
use candid::Principal;
use ic_cdk::api::time;
use shared::controllers::is_controller;
use shared::types::state::Controllers;
use shared::utils::principal_not_equal;
use std::collections::HashMap;

use crate::rules::types::rules::Rule;
use crate::rules::utils::{assert_create_rule, assert_rule, is_known_user, public_rule};
use crate::storage::cert::update_certified_data;
use crate::storage::constants::{
    ASSET_ENCODING_NO_COMPRESSION, BN_WELL_KNOWN_CUSTOM_DOMAINS, ENCODING_CERTIFICATION_ORDER,
};
use crate::storage::custom_domains::map_custom_domains_asset;
use crate::storage::runtime::{
    clear_batch as clear_runtime_batch, clear_expired_batches as clear_expired_runtime_batches,
    clear_expired_chunks as clear_expired_runtime_chunks,
    delete_certified_asset as delete_runtime_certified_asset, get_batch as get_runtime_batch,
    get_chunk as get_runtime_chunk, insert_batch as insert_runtime_batch,
    insert_chunk as insert_runtime_chunk,
};
use crate::storage::state::{
    delete_asset as delete_state_asset, get_asset as get_state_asset,
    get_assets as get_state_assets, get_public_asset as get_state_public_asset,
    get_rules as get_state_rules, insert_asset as insert_state_asset,
};
use crate::storage::types::assets::AssetHashes;
use crate::storage::types::config::StorageConfig;
use crate::storage::types::domain::{CustomDomain, CustomDomains, DomainName};
use crate::storage::types::http_request::{MapUrl, PublicAsset};
use crate::storage::types::interface::{AssetNoContent, CommitBatch, InitAssetKey};
use crate::storage::types::state::{FullPath, StorageHeapState, StorageRuntimeState};
use crate::storage::types::store::{Asset, AssetEncoding, AssetKey, Batch, Chunk};
use crate::storage::url::{map_alternative_paths, map_url};
use crate::storage::utils::{filter_collection_values, filter_values};
use crate::types::core::CollectionKey;
use crate::types::list::{ListParams, ListResults};
use crate::types::state::State;

///
/// Getter, list and delete
///

pub fn get_public_asset_for_url(url: String) -> Result<PublicAsset, &'static str> {
    if url.is_empty() {
        return Err("No url provided.");
    }

    // The certification considers, and should only, the path of the URL. If query parameters, these should be omitted in the certificate.
    // Likewise the memory contains only assets indexed with their respective path.
    // e.g.
    // url: /hello/something?param=123
    // path: /hello/something

    let MapUrl { path, token } = map_url(&url)?;
    let alternative_paths = map_alternative_paths(&path);

    // ⚠️ Limitation: requesting an url without extension try to resolve first a corresponding asset
    // e.g. /.well-known/hello -> try to find /.well-known/hello.html
    // Therefore if a file without extension is uploaded to the storage, it is important to not upload an .html file with the same name next to it or a folder/index.html

    for alternative_path in alternative_paths {
        let asset: Option<Asset> = get_public_asset(alternative_path, token.clone());

        // We return the first match
        match asset {
            None => (),
            Some(_) => {
                return Ok(PublicAsset { url: path, asset });
            }
        }
    }

    let asset: Option<Asset> = get_public_asset(path.clone(), token);
    Ok(PublicAsset { url: path, asset })
}

pub fn delete_asset(
    caller: Principal,
    collection: &CollectionKey,
    full_path: FullPath,
) -> Result<Option<Asset>, String> {
    let controllers: Controllers = STATE.with(|state| state.borrow().heap.controllers.clone());

    secure_delete_asset_impl(caller, &controllers, collection, full_path)
}

pub fn delete_assets(collection: &CollectionKey) {
    STATE.with(|state| delete_assets_impl(collection, &mut state.borrow_mut()))
}

pub fn list_assets(
    caller: Principal,
    collection: &CollectionKey,
    filters: &ListParams,
) -> Result<ListResults<AssetNoContent>, String> {
    let controllers: Controllers = STATE.with(|state| state.borrow().heap.controllers.clone());

    secure_list_assets_impl(caller, &controllers, collection, filters)
}

pub fn get_public_asset(full_path: FullPath, token: Option<String>) -> Option<Asset> {
    let asset = get_state_public_asset(&full_path);

    match asset {
        None => None,
        Some(asset) => match &asset.key.token {
            None => Some(asset.clone()),
            Some(asset_token) => get_token_protected_asset(&asset, asset_token, token),
        },
    }
}

fn get_token_protected_asset(
    asset: &Asset,
    asset_token: &String,
    token: Option<String>,
) -> Option<Asset> {
    match token {
        None => None,
        Some(token) => {
            if &token == asset_token {
                return Some(asset.clone());
            }

            None
        }
    }
}

pub fn assert_assets_collection_empty(collection: &CollectionKey) -> Result<(), String> {
    let rules = get_state_rules(collection);

    match rules {
        None => Err([COLLECTION_NOT_FOUND, collection].join("")),
        Some(rules) => {
            let assets = get_state_assets(collection, &rules);

            let values = filter_collection_values(collection.clone(), &assets);

            if !values.is_empty() {
                return Err([COLLECTION_NOT_EMPTY, collection].join(""));
            }

            Ok(())
        }
    }
}

fn secure_list_assets_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: &CollectionKey,
    filters: &ListParams,
) -> Result<ListResults<AssetNoContent>, String> {
    let rules = get_state_rules(collection);

    match rules {
        None => Err([COLLECTION_READ_RULE_MISSING, collection].join("")),
        Some(rule) => Ok(list_assets_impl(
            caller,
            controllers,
            collection,
            &rule,
            filters,
        )),
    }
}

fn list_assets_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: &CollectionKey,
    rule: &Rule,
    filters: &ListParams,
) -> ListResults<AssetNoContent> {
    let assets = get_state_assets(collection, rule);

    let matches: Vec<(FullPath, AssetNoContent)> = filter_values(
        caller,
        controllers,
        &rule.read,
        collection.clone(),
        filters,
        &assets,
    );

    list_values(matches, filters)
}

fn secure_delete_asset_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: &CollectionKey,
    full_path: FullPath,
) -> Result<Option<Asset>, String> {
    let rules = get_state_rules(collection);

    match rules {
        None => Err([COLLECTION_WRITE_RULE_MISSING, collection].join("")),
        Some(rule) => delete_asset_impl(caller, controllers, full_path, &rule),
    }
}

fn delete_asset_impl(
    caller: Principal,
    controllers: &Controllers,
    full_path: FullPath,
    rule: &Rule,
) -> Result<Option<Asset>, String> {
    let asset = get_state_asset(&full_path, rule);

    match asset {
        None => Err(ERROR_ASSET_NOT_FOUND.to_string()),
        Some(asset) => {
            if !assert_rule(&rule.write, asset.key.owner, caller, controllers) {
                return Err(ERROR_ASSET_NOT_FOUND.to_string());
            }

            let deleted = delete_state_asset(&full_path, rule);
            delete_runtime_certified_asset(&full_path);
            Ok(deleted)
        }
    }
}

fn delete_assets_impl(collection: &CollectionKey, state: &mut State) {
    let full_paths: Vec<String> = state
        .heap
        .storage
        .assets
        .values()
        .filter(|asset| asset.key.collection == collection.clone())
        .map(|asset| asset.key.full_path.clone())
        .collect();

    for full_path in full_paths {
        state.heap.storage.assets.remove(&full_path);
        delete_runtime_certified_asset(&full_path);
    }
}

///
/// Upload batch and chunks
///

const BATCH_EXPIRY_NANOS: u64 = 300_000_000_000;

static mut NEXT_BATCH_ID: u128 = 0;
static mut NEXT_CHUNK_ID: u128 = 0;

pub fn create_batch(caller: Principal, init: InitAssetKey) -> Result<u128, String> {
    let controllers: Controllers = STATE.with(|state| state.borrow().heap.controllers.clone());
    secure_create_batch_impl(caller, &controllers, init)
}

pub fn create_chunk(caller: Principal, chunk: Chunk) -> Result<u128, &'static str> {
    create_chunk_impl(caller, chunk)
}

pub fn commit_batch(caller: Principal, commit_batch: CommitBatch) -> Result<(), String> {
    let controllers: Controllers = STATE.with(|state| state.borrow().heap.controllers.clone());

    STATE.with(|state| {
        commit_batch_impl(caller, &controllers, commit_batch, &mut state.borrow_mut())
    })
}

fn secure_create_batch_impl(
    caller: Principal,
    controllers: &Controllers,
    init: InitAssetKey,
) -> Result<u128, String> {
    let rules = get_state_rules(&init.collection);

    match rules {
        None => Err([COLLECTION_WRITE_RULE_MISSING, &init.collection].join("")),
        Some(rules) => {
            if !(public_rule(&rules.write)
                || is_known_user(caller)
                || is_controller(caller, controllers))
            {
                return Err(UPLOAD_NOT_ALLOWED.to_string());
            }

            assert_key(caller, &init.full_path, &init.collection, controllers)?;

            assert_description_length(&init.description)?;

            // Assert supported encoding type
            get_encoding_type(&init.encoding_type)?;

            Ok(create_batch_impl(caller, init))
        }
    }
}

fn create_batch_impl(
    caller: Principal,
    InitAssetKey {
        token,
        name,
        collection,
        encoding_type,
        full_path,
        description,
    }: InitAssetKey,
) -> u128 {
    let now = time();

    unsafe {
        clear_expired_batches();

        NEXT_BATCH_ID += 1;

        let key: AssetKey = AssetKey {
            full_path,
            collection,
            owner: caller,
            token,
            name,
            description,
        };

        insert_runtime_batch(
            &NEXT_BATCH_ID,
            Batch {
                key,
                expires_at: now + BATCH_EXPIRY_NANOS,
                encoding_type,
            },
        );

        NEXT_BATCH_ID
    }
}

fn create_chunk_impl(
    caller: Principal,
    Chunk { batch_id, content }: Chunk,
) -> Result<u128, &'static str> {
    let batch = get_runtime_batch(&batch_id);

    match batch {
        None => Err("Batch not found."),
        Some(b) => {
            if principal_not_equal(caller, b.key.owner) {
                return Err("Bach initializer does not match chunk uploader.");
            }

            let now = time();

            // Update batch to extend expires_at
            insert_runtime_batch(
                &batch_id,
                Batch {
                    key: b.key.clone(),
                    expires_at: now + BATCH_EXPIRY_NANOS,
                    encoding_type: b.encoding_type,
                },
            );

            unsafe {
                NEXT_CHUNK_ID += 1;

                insert_runtime_chunk(&NEXT_CHUNK_ID, Chunk { batch_id, content });

                Ok(NEXT_CHUNK_ID)
            }
        }
    }
}

fn commit_batch_impl(
    caller: Principal,
    controllers: &Controllers,
    commit_batch: CommitBatch,
    state: &mut State,
) -> Result<(), String> {
    let batch = get_runtime_batch(&commit_batch.batch_id);

    match batch {
        None => Err(ERROR_CANNOT_COMMIT_BATCH.to_string()),
        Some(b) => {
            let asset = secure_commit_chunks(caller, controllers, commit_batch, &b);
            match asset {
                Err(err) => Err(err),
                Ok(asset) => {
                    update_certified_asset(state, &asset);
                    Ok(())
                }
            }
        }
    }
}

fn assert_key(
    caller: Principal,
    full_path: &FullPath,
    collection: &CollectionKey,
    controllers: &Controllers,
) -> Result<(), &'static str> {
    // /.well-known/ic-domains is automatically generated for custom domains
    if full_path == BN_WELL_KNOWN_CUSTOM_DOMAINS {
        let error =
            format!("{} is a reserved asset.", BN_WELL_KNOWN_CUSTOM_DOMAINS).into_boxed_str();
        return Err(Box::leak(error));
    }

    let dapp_collection = DEFAULT_ASSETS_COLLECTIONS[0].0;

    // Only controllers can write in collection #dapp
    if collection.clone() == *dapp_collection && !is_controller(caller, controllers) {
        return Err(UPLOAD_NOT_ALLOWED);
    }

    // Asset uploaded by users should be prefixed with the collection. That way developers can organize assets to particular folders.
    if collection.clone() != *dapp_collection
        && !full_path.starts_with(&["/", collection, "/"].join(""))
    {
        return Err("Asset path must be prefixed with collection key.");
    }

    Ok(())
}

fn secure_commit_chunks(
    caller: Principal,
    controllers: &Controllers,
    commit_batch: CommitBatch,
    batch: &Batch,
) -> Result<Asset, String> {
    // The one that started the batch should be the one that commits it
    if principal_not_equal(caller, batch.key.owner) {
        return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
    }

    assert_key(
        caller,
        &batch.key.full_path,
        &batch.key.collection,
        controllers,
    )?;

    let rules = get_state_rules(&batch.key.collection);

    match rules {
        None => Err([COLLECTION_WRITE_RULE_MISSING, &batch.key.collection].join("")),
        Some(rules) => {
            let current = get_state_asset(&batch.key.full_path, &rules);

            match current {
                None => {
                    if !assert_create_rule(&rules.write, caller, controllers) {
                        return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
                    }

                    commit_chunks(commit_batch, batch, rules.max_size, &rules)
                }
                Some(current) => secure_commit_chunks_update(
                    caller,
                    controllers,
                    commit_batch,
                    batch,
                    rules,
                    current.clone(),
                ),
            }
        }
    }
}

fn secure_commit_chunks_update(
    caller: Principal,
    controllers: &Controllers,
    commit_batch: CommitBatch,
    batch: &Batch,
    rules: Rule,
    current: Asset,
) -> Result<Asset, String> {
    // The collection of the existing asset should be the same as the one we commit
    if batch.key.collection != current.key.collection {
        return Err("Provided collection does not match existing collection.".to_string());
    }

    let rule = &rules.write;

    if !assert_rule(rule, current.key.owner, caller, controllers) {
        return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
    }

    commit_chunks(commit_batch, batch, rules.max_size, &rules)
}

fn commit_chunks(
    CommitBatch {
        chunk_ids,
        batch_id,
        headers,
    }: CommitBatch,
    batch: &Batch,
    max_size: Option<u128>,
    rules: &Rule,
) -> Result<Asset, String> {
    let now = time();

    if now > batch.expires_at {
        clear_expired_batches();
        return Err("Batch did not complete in time. Chunks cannot be committed.".to_string());
    }

    let mut content_chunks: Vec<Vec<u8>> = vec![];

    for chunk_id in chunk_ids.iter() {
        let chunk = get_runtime_chunk(chunk_id);

        match chunk {
            None => {
                return Err("Chunk does not exist.".to_string());
            }
            Some(c) => {
                if batch_id != c.batch_id {
                    return Err("Chunk not included in the provided batch.".to_string());
                }

                content_chunks.push(c.clone().content);
            }
        }
    }

    if content_chunks.is_empty() {
        return Err("No chunk to commit.".to_string());
    }

    let key = batch.clone().key;

    let now = time();

    let mut asset: Asset = Asset {
        key,
        headers,
        encodings: HashMap::new(),
        created_at: now,
        updated_at: now,
    };

    if let Some(existing_asset) = get_state_asset(&batch.clone().key.full_path, rules) {
        asset.encodings = existing_asset.encodings.clone();
        asset.created_at = existing_asset.created_at;
    }

    let encoding_type = get_encoding_type(&batch.encoding_type)?;

    let encoding = AssetEncoding::from(&content_chunks);

    match max_size {
        None => (),
        Some(max_size) => {
            if encoding.total_length > max_size {
                clear_runtime_batch(&batch_id, &chunk_ids);
                return Err("Asset exceed max allowed size.".to_string());
            }
        }
    }

    asset.encodings.insert(encoding_type, encoding);

    insert_state_asset(&batch.clone().key.full_path, &asset, rules);

    clear_runtime_batch(&batch_id, &chunk_ids);

    Ok(asset)
}

fn get_encoding_type(encoding_type: &Option<String>) -> Result<String, &'static str> {
    let provided_type = encoding_type
        .clone()
        .unwrap_or_else(|| ASSET_ENCODING_NO_COMPRESSION.to_string());
    let matching_type = Vec::from(ENCODING_CERTIFICATION_ORDER)
        .iter()
        .any(|&e| *e == provided_type);

    if !matching_type {
        return Err("Asset encoding not supported for certification purpose.");
    }

    Ok(provided_type)
}

fn clear_expired_batches() {
    // Remove expired batches
    clear_expired_runtime_batches();

    // Remove chunk without existing batches (those we just deleted above)
    clear_expired_runtime_chunks();
}

///
/// Config
///

pub fn set_config(config: &StorageConfig) {
    STATE.with(|state| set_config_impl(config, &mut state.borrow_mut().heap.storage))
}

fn set_config_impl(config: &StorageConfig, state: &mut StorageHeapState) {
    state.config = config.clone();
}

pub fn get_config() -> StorageConfig {
    STATE.with(|state| state.borrow().heap.storage.config.clone())
}

///
/// Domain
///

pub fn set_domain(domain_name: &DomainName, bn_id: &Option<String>) {
    STATE.with(|state| set_domain_impl(domain_name, bn_id, &mut state.borrow_mut()))
}

pub fn delete_domain(domain_name: &DomainName) {
    STATE.with(|state| delete_domain_impl(domain_name, &mut state.borrow_mut()))
}

fn delete_domain_impl(domain_name: &DomainName, state: &mut State) {
    state.heap.storage.custom_domains.remove(domain_name);

    update_custom_domains_asset(state);
}

fn set_domain_impl(domain_name: &DomainName, bn_id: &Option<String>, state: &mut State) {
    set_stable_domain_impl(domain_name, bn_id, state);

    update_custom_domains_asset(state);
}

fn update_custom_domains_asset(state: &mut State) {
    let custom_domains = get_custom_domains_as_content(&state.heap.storage.custom_domains);

    let full_path = BN_WELL_KNOWN_CUSTOM_DOMAINS.to_string();

    let existing_asset = state.heap.storage.assets.get(&full_path);

    let asset = map_custom_domains_asset(&custom_domains, existing_asset);

    state.heap.storage.assets.insert(full_path, asset.clone());

    update_certified_asset(state, &asset);
}

fn set_stable_domain_impl(domain_name: &DomainName, bn_id: &Option<String>, state: &mut State) {
    let domain = state.heap.storage.custom_domains.get(domain_name);

    let now = time();

    let created_at: u64 = match domain {
        None => now,
        Some(domain) => domain.created_at,
    };

    let updated_at: u64 = now;

    let custom_domain = CustomDomain {
        bn_id: bn_id.to_owned(),
        created_at,
        updated_at,
    };

    state
        .heap
        .storage
        .custom_domains
        .insert(domain_name.clone(), custom_domain);
}

fn get_custom_domains_as_content(custom_domains: &CustomDomains) -> String {
    custom_domains
        .clone()
        .into_keys()
        .collect::<Vec<DomainName>>()
        .join("\n")
}

pub fn get_custom_domains() -> CustomDomains {
    STATE.with(|state| state.borrow().heap.storage.custom_domains.clone())
}

/// Certified assets

fn update_certified_asset(state: &mut State, asset: &Asset) {
    // 1. Replace or insert the new asset in tree
    state.runtime.storage.asset_hashes.insert(asset);

    // 2. Update the root hash and the canister certified data
    update_certified_data(&state.runtime.storage.asset_hashes);
}

pub fn init_certified_assets() {
    let asset_hashes = STATE.with(|state| AssetHashes::from(&state.borrow().heap.storage));

    STATE.with(|state| {
        init_certified_assets_impl(&asset_hashes, &mut state.borrow_mut().runtime.storage)
    });
}

fn init_certified_assets_impl(asset_hashes: &AssetHashes, storage: &mut StorageRuntimeState) {
    // 1. Init all asset in tree
    storage.asset_hashes = asset_hashes.clone();

    // 2. Update the root hash and the canister certified data
    update_certified_data(&storage.asset_hashes);
}
