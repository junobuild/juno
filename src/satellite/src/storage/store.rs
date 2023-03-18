use crate::list::utils::list_values;
use crate::rules::constants::DEFAULT_ASSETS_COLLECTIONS;
use candid::Principal;
use ic_cdk::api::time;
use shared::controllers::is_controller;
use shared::types::state::Controllers;
use shared::utils::principal_not_equal;
use std::borrow::BorrowMut;
use std::collections::HashMap;

use crate::rules::types::rules::{Permission, Rule};
use crate::rules::utils::{assert_rule, is_known_user, public_rule};
use crate::storage::cert::update_certified_data;
use crate::storage::constants::{
    ASSET_ENCODING_NO_COMPRESSION, BN_WELL_KNOWN_CUSTOM_DOMAINS, ENCODING_CERTIFICATION_ORDER,
};
use crate::storage::custom_domains::map_custom_domains_asset;
use crate::storage::types::config::StorageConfig;
use crate::storage::types::domain::{CustomDomain, CustomDomains, DomainName};
use crate::storage::types::http_request::{MapUrl, PublicAsset};
use crate::storage::types::interface::{
    AssetEncodingNoContent, AssetNoContent, CommitBatch, InitAssetKey,
};
use crate::storage::types::state::{Assets, FullPath, StorageRuntimeState, StorageStableState};
use crate::storage::types::store::{Asset, AssetEncoding, AssetKey, Batch, Chunk};
use crate::storage::url::{map_alternative_paths, map_url};
use crate::types::core::CollectionKey;
use crate::types::list::{ListParams, ListResults};
use crate::types::state::{RuntimeState, State};
use crate::STATE;

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

pub fn get_public_asset(full_path: String, token: Option<String>) -> Option<Asset> {
    STATE.with(|state| get_public_asset_impl(full_path, token, &state.borrow().stable.storage))
}

pub fn delete_asset(
    caller: Principal,
    collection: String,
    full_path: String,
) -> Result<Option<Asset>, &'static str> {
    let controllers: Controllers = STATE.with(|state| state.borrow().stable.controllers.clone());

    STATE.with(|state| {
        secure_delete_asset_impl(
            caller,
            &controllers,
            collection,
            full_path,
            &mut state.borrow_mut(),
        )
    })
}

pub fn delete_assets(collection: String) {
    STATE.with(|state| delete_assets_impl(collection, &mut state.borrow_mut()))
}

pub fn list_assets(
    caller: Principal,
    collection: String,
    filters: &ListParams,
) -> Result<ListResults<AssetNoContent>, String> {
    let controllers: Controllers = STATE.with(|state| state.borrow().stable.controllers.clone());

    STATE.with(|state| {
        secure_list_assets_impl(
            caller,
            &controllers,
            collection,
            &state.borrow().stable.storage,
            filters,
        )
    })
}

fn get_public_asset_impl(
    full_path: String,
    token: Option<String>,
    state: &StorageStableState,
) -> Option<Asset> {
    let asset = state.assets.get(&full_path);

    match asset {
        None => None,
        Some(asset) => match &asset.key.token {
            None => Some(asset.clone()),
            Some(asset_token) => get_token_protected_asset(asset, asset_token, token),
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

fn secure_list_assets_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: String,
    state: &StorageStableState,
    filters: &ListParams,
) -> Result<ListResults<AssetNoContent>, String> {
    let rules = state.rules.get(&collection);

    match rules {
        None => Err("Collection read rule not configured.".to_string()),
        Some(rule) => Ok(list_assets_impl(
            caller,
            controllers,
            collection,
            &rule.read,
            state,
            filters,
        )),
    }
}

fn list_assets_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: String,
    rule: &Permission,
    state: &StorageStableState,
    filters: &ListParams,
) -> ListResults<AssetNoContent> {
    fn map_key(asset: &Asset) -> (FullPath, AssetNoContent) {
        (
            asset.key.full_path.clone(),
            AssetNoContent {
                key: asset.key.clone(),
                headers: asset.headers.clone(),
                encodings: asset
                    .encodings
                    .clone()
                    .into_iter()
                    .map(|(key, encoding)| {
                        (
                            key,
                            AssetEncodingNoContent {
                                modified: encoding.modified,
                                total_length: encoding.total_length,
                                sha256: encoding.sha256,
                            },
                        )
                    })
                    .collect(),
                created_at: asset.created_at,
                updated_at: asset.updated_at,
            },
        )
    }

    let all_keys = state.assets.values().map(map_key);

    let matches: Vec<(FullPath, AssetNoContent)> = all_keys
        .into_iter()
        .filter(|(_, asset)| asset.key.collection == collection)
        .filter(|(_, asset)| assert_rule(rule, asset.key.owner, caller, controllers))
        .collect();

    list_values(matches, filters)
}

fn secure_delete_asset_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: String,
    full_path: String,
    state: &mut State,
) -> Result<Option<Asset>, &'static str> {
    let rules = state.stable.storage.rules.get(&collection);

    match rules {
        None => Err("Collection write rule not configured."),
        Some(rule) => delete_asset_impl(
            caller,
            controllers,
            full_path,
            &rule.write,
            &mut state.stable.storage.assets,
            &mut state.runtime,
        ),
    }
}

const ERROR_ASSET_NOT_FOUND: &str = "No asset.";

fn delete_asset_impl(
    caller: Principal,
    controllers: &Controllers,
    full_path: String,
    rule: &Permission,
    assets: &mut Assets,
    runtime: &mut RuntimeState,
) -> Result<Option<Asset>, &'static str> {
    let asset = assets.get_mut(&full_path);

    match asset {
        None => Err(ERROR_ASSET_NOT_FOUND),
        Some(asset) => {
            if !assert_rule(rule, asset.key.owner, caller, controllers) {
                return Err(ERROR_ASSET_NOT_FOUND);
            }

            let deleted = assets.remove(&*full_path);
            delete_certified_asset(runtime, &full_path);
            Ok(deleted)
        }
    }
}

fn delete_assets_impl(collection: String, state: &mut State) {
    let full_paths: Vec<String> = state
        .stable
        .storage
        .assets
        .values()
        .filter(|asset| asset.key.collection == collection)
        .map(|asset| asset.key.full_path.clone())
        .collect();

    for full_path in full_paths {
        state.stable.storage.assets.remove(&full_path);
        delete_certified_asset(&mut state.runtime, &full_path);
    }
}

///
/// Upload batch and chunks
///

const BATCH_EXPIRY_NANOS: u64 = 300_000_000_000;

static mut NEXT_BACK_ID: u128 = 0;
static mut NEXT_CHUNK_ID: u128 = 0;

pub fn create_batch(caller: Principal, init: InitAssetKey) -> Result<u128, &'static str> {
    STATE.with(|state| secure_create_batch_impl(caller, init, &mut state.borrow_mut()))
}

pub fn create_chunk(caller: Principal, chunk: Chunk) -> Result<u128, &'static str> {
    STATE.with(|state| create_chunk_impl(caller, chunk, &mut state.borrow_mut().runtime.storage))
}

pub fn commit_batch(caller: Principal, commit_batch: CommitBatch) -> Result<(), &'static str> {
    let controllers: Controllers = STATE.with(|state| state.borrow().stable.controllers.clone());

    STATE.with(|state| {
        commit_batch_impl(caller, &controllers, commit_batch, &mut state.borrow_mut())
    })
}

const UPLOAD_NOT_ALLOWED: &str = "Caller not allowed to upload data.";
const COLLECTION_WRITE_RULE_MISSING: &str = "Collection write rule not configured.";

fn secure_create_batch_impl(
    caller: Principal,
    init: InitAssetKey,
    state: &mut State,
) -> Result<u128, &'static str> {
    let rules = state.stable.storage.rules.get(&init.collection);

    match rules {
        None => Err(COLLECTION_WRITE_RULE_MISSING),
        Some(rules) => {
            if !(public_rule(&rules.write)
                || is_known_user(caller, &state.stable.db.db)
                || is_controller(caller, &state.stable.controllers))
            {
                return Err(UPLOAD_NOT_ALLOWED);
            }

            assert_key(
                caller,
                &init.full_path,
                &init.collection,
                &state.stable.controllers,
            )?;

            // Assert supported encoding type
            get_encoding_type(&init.encoding_type)?;

            Ok(create_batch_impl(
                caller,
                init,
                state.runtime.storage.borrow_mut(),
            ))
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
    }: InitAssetKey,
    state: &mut StorageRuntimeState,
) -> u128 {
    let now = time();

    unsafe {
        clear_expired_batches(state);

        NEXT_BACK_ID += 1;

        let key: AssetKey = AssetKey {
            full_path,
            collection,
            owner: caller,
            token,
            name,
        };

        state.batches.insert(
            NEXT_BACK_ID,
            Batch {
                key,
                expires_at: now + BATCH_EXPIRY_NANOS,
                encoding_type,
            },
        );

        NEXT_BACK_ID
    }
}

fn create_chunk_impl(
    caller: Principal,
    Chunk { batch_id, content }: Chunk,
    state: &mut StorageRuntimeState,
) -> Result<u128, &'static str> {
    let batch = state.batches.get(&batch_id);

    match batch {
        None => Err("Batch not found."),
        Some(b) => {
            if principal_not_equal(caller, b.key.owner) {
                return Err("Bach initializer does not match chunk uploader.");
            }

            let now = time();

            state.batches.insert(
                batch_id,
                Batch {
                    key: b.key.clone(),
                    expires_at: now + BATCH_EXPIRY_NANOS,
                    encoding_type: b.encoding_type.clone(),
                },
            );

            unsafe {
                NEXT_CHUNK_ID += 1;

                state
                    .chunks
                    .insert(NEXT_CHUNK_ID, Chunk { batch_id, content });

                Ok(NEXT_CHUNK_ID)
            }
        }
    }
}

const ERROR_CANNOT_COMMIT_BATCH: &str = "Cannot commit batch.";

fn commit_batch_impl(
    caller: Principal,
    controllers: &Controllers,
    commit_batch: CommitBatch,
    state: &mut State,
) -> Result<(), &'static str> {
    let batches = state.runtime.storage.batches.clone();
    let batch = batches.get(&commit_batch.batch_id);

    match batch {
        None => Err(ERROR_CANNOT_COMMIT_BATCH),
        Some(b) => {
            let asset = secure_commit_chunks(caller, controllers, commit_batch, b, state);
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
    state: &mut State,
) -> Result<Asset, &'static str> {
    // The one that started the batch should be the one that commits it
    if principal_not_equal(caller, batch.key.owner) {
        return Err(ERROR_CANNOT_COMMIT_BATCH);
    }

    assert_key(
        caller,
        &batch.key.full_path,
        &batch.key.collection,
        controllers,
    )?;

    let rules = state.stable.storage.rules.get(&batch.key.collection);

    match rules {
        None => Err(COLLECTION_WRITE_RULE_MISSING),
        Some(rules) => {
            let current = state.stable.storage.assets.get(&batch.key.full_path);

            match current {
                None => commit_chunks(commit_batch, batch, rules.max_size, state),
                Some(current) => secure_commit_chunks_update(
                    caller,
                    controllers,
                    commit_batch,
                    batch,
                    rules.clone(),
                    current.clone(),
                    state,
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
    state: &mut State,
) -> Result<Asset, &'static str> {
    // The collection of the existing asset should be the same as the one we commit
    if batch.key.collection != current.key.collection {
        return Err("Provided collection does not match existing collection.");
    }

    let rule = &rules.write;

    if !assert_rule(rule, current.key.owner, caller, controllers) {
        return Err(ERROR_CANNOT_COMMIT_BATCH);
    }

    commit_chunks(commit_batch, batch, rules.max_size, state)
}

fn commit_chunks(
    CommitBatch {
        chunk_ids,
        batch_id,
        headers,
    }: CommitBatch,
    batch: &Batch,
    max_size: Option<u128>,
    state: &mut State,
) -> Result<Asset, &'static str> {
    let now = time();

    if now > batch.expires_at {
        clear_expired_batches(&mut state.runtime.storage);
        return Err("Batch did not complete in time. Chunks cannot be committed.");
    }

    let mut content_chunks: Vec<Vec<u8>> = vec![];

    for chunk_id in chunk_ids.iter() {
        let chunk = state.runtime.storage.chunks.get(chunk_id);

        match chunk {
            None => {
                return Err("Chunk does not exist.");
            }
            Some(c) => {
                if batch_id != c.batch_id {
                    return Err("Chunk not included in the provided batch.");
                }

                content_chunks.push(c.clone().content);
            }
        }
    }

    if content_chunks.is_empty() {
        return Err("No chunk to commit.");
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

    if let Some(existing_asset) = state
        .stable
        .storage
        .assets
        .get(&batch.clone().key.full_path)
    {
        asset.encodings = existing_asset.encodings.clone();
        asset.created_at = existing_asset.created_at;
    }

    let encoding_type = get_encoding_type(&batch.encoding_type)?;

    let encoding = AssetEncoding::from(&content_chunks);

    match max_size {
        None => (),
        Some(max_size) => {
            if encoding.total_length > max_size {
                clear_batch(batch_id, chunk_ids, &mut state.runtime.storage);
                return Err("Asset exceed max allowed size.");
            }
        }
    }

    asset.encodings.insert(encoding_type, encoding);

    state
        .stable
        .storage
        .assets
        .insert(batch.clone().key.full_path, asset.clone());

    clear_batch(batch_id, chunk_ids, &mut state.runtime.storage);

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

fn clear_expired_batches(state: &mut StorageRuntimeState) {
    let now = time();

    // Remove expired batches

    let batches = state.batches.clone();

    for (batch_id, batch) in batches.iter() {
        if now > batch.expires_at {
            state.batches.remove(batch_id);
        }
    }

    // Remove chunk without existing batches (those we just deleted above)

    let chunks = state.chunks.clone();

    for (chunk_id, chunk) in chunks.iter() {
        if state.batches.get(&chunk.batch_id).is_none() {
            state.chunks.remove(chunk_id);
        }
    }
}

fn clear_batch(batch_id: u128, chunk_ids: Vec<u128>, state: &mut StorageRuntimeState) {
    for chunk_id in chunk_ids.iter() {
        state.chunks.remove(chunk_id);
    }

    state.batches.remove(&batch_id);
}

///
/// Config
///

pub fn set_config(config: &StorageConfig) {
    STATE.with(|state| set_config_impl(config, &mut state.borrow_mut().stable.storage))
}

fn set_config_impl(config: &StorageConfig, state: &mut StorageStableState) {
    state.config = config.clone();
}

pub fn get_config() -> StorageConfig {
    STATE.with(|state| state.borrow().stable.storage.config.clone())
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
    state.stable.storage.custom_domains.remove(domain_name);

    update_custom_domains_asset(state);
}

fn set_domain_impl(domain_name: &DomainName, bn_id: &Option<String>, state: &mut State) {
    set_stable_domain_impl(domain_name, bn_id, state);

    update_custom_domains_asset(state);
}

fn update_custom_domains_asset(state: &mut State) {
    let custom_domains = get_custom_domains_as_content(&state.stable.storage.custom_domains);

    let full_path = BN_WELL_KNOWN_CUSTOM_DOMAINS.to_string();

    let existing_asset = state.stable.storage.assets.get(&full_path);

    let asset = map_custom_domains_asset(&custom_domains, existing_asset);

    state
        .stable
        .storage
        .assets
        .insert(full_path.clone(), asset.clone());

    update_certified_asset(state, &asset);
}

fn set_stable_domain_impl(domain_name: &DomainName, bn_id: &Option<String>, state: &mut State) {
    let domain = state.stable.storage.custom_domains.get(domain_name);

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
        .stable
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
    STATE.with(|state| state.borrow().stable.storage.custom_domains.clone())
}

/// Certified assets

fn update_certified_asset(state: &mut State, asset: &Asset) {
    // 1. Replace or insert the new asset in tree
    state.runtime.storage.asset_hashes.insert(asset);

    // 2. Update the root hash and the canister certified data
    update_certified_data(&state.runtime.storage.asset_hashes);
}

fn delete_certified_asset(runtime: &mut RuntimeState, full_path: &String) {
    // 1. Remove the asset in tree
    runtime.storage.asset_hashes.delete(full_path);

    // 2. Update the root hash and the canister certified data
    update_certified_data(&runtime.storage.asset_hashes);
}
