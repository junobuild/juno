use crate::assert::assert_description_length;
use crate::controllers::store::get_controllers;
use crate::list::utils::list_values;
use crate::msg::{
    COLLECTION_NOT_EMPTY, ERROR_ASSET_NOT_FOUND, ERROR_CANNOT_COMMIT_BATCH, UPLOAD_NOT_ALLOWED,
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
use crate::storage::constants::{
    ASSET_ENCODING_NO_COMPRESSION, BN_WELL_KNOWN_CUSTOM_DOMAINS, ENCODING_CERTIFICATION_ORDER,
};
use crate::storage::custom_domains::map_custom_domains_asset;
use crate::storage::runtime::{
    clear_batch as clear_runtime_batch, clear_expired_batches as clear_expired_runtime_batches,
    clear_expired_chunks as clear_expired_runtime_chunks,
    delete_certified_asset as delete_runtime_certified_asset, get_batch as get_runtime_batch,
    get_chunk as get_runtime_chunk, init_certified_assets as init_runtime_certified_assets,
    insert_batch as insert_runtime_batch, insert_chunk as insert_runtime_chunk,
    update_certified_asset as update_runtime_certified_asset,
};
use crate::storage::state::{
    delete_asset as delete_state_asset, delete_domain as delete_state_domain,
    get_asset as get_state_asset, get_assets as get_state_assets, get_config as get_state_config,
    get_domain as get_state_domain, get_domains as get_state_domains,
    get_public_asset as get_state_public_asset, get_rule as get_state_rule, get_rule,
    insert_asset as insert_state_asset, insert_config as insert_state_config,
    insert_domain as insert_state_domain,
};
use crate::storage::types::config::StorageConfig;
use crate::storage::types::domain::{CustomDomain, CustomDomains, DomainName};
use crate::storage::types::http_request::{MapUrl, PublicAsset};
use crate::storage::types::interface::{AssetNoContent, CommitBatch, InitAssetKey, UploadChunk};
use crate::storage::types::state::FullPath;
use crate::storage::types::store::{Asset, AssetEncoding, AssetKey, Batch, Chunk};
use crate::storage::url::{map_alternative_paths, map_url};
use crate::storage::utils::{filter_collection_values, filter_values};
use crate::types::core::CollectionKey;
use crate::types::list::{ListParams, ListResults};

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
    let controllers: Controllers = get_controllers();

    secure_delete_asset_impl(caller, &controllers, collection, full_path)
}

pub fn delete_assets(collection: &CollectionKey) -> Result<(), String> {
    delete_assets_impl(collection)
}

pub fn list_assets(
    caller: Principal,
    collection: &CollectionKey,
    filters: &ListParams,
) -> Result<ListResults<AssetNoContent>, String> {
    let controllers: Controllers = get_controllers();

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
    let rule = get_state_rule(collection)?;

    let assets = get_state_assets(collection, &rule);

    let values = filter_collection_values(collection.clone(), &assets);

    if !values.is_empty() {
        return Err([COLLECTION_NOT_EMPTY, collection].join(""));
    }

    Ok(())
}

fn secure_list_assets_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: &CollectionKey,
    filters: &ListParams,
) -> Result<ListResults<AssetNoContent>, String> {
    let rule = get_state_rule(collection)?;

    Ok(list_assets_impl(
        caller,
        controllers,
        collection,
        &rule,
        filters,
    ))
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
    let rule = get_state_rule(collection)?;

    delete_asset_impl(caller, controllers, full_path, &rule)
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

fn delete_assets_impl(collection: &CollectionKey) -> Result<(), String> {
    let rule = get_state_rule(collection)?;

    let full_paths: Vec<String> = get_state_assets(collection, &rule)
        .iter()
        .filter(|asset| asset.key.collection == collection.clone())
        .map(|asset| asset.key.full_path.clone())
        .collect();

    for full_path in full_paths {
        delete_state_asset(&full_path, &rule);
        delete_runtime_certified_asset(&full_path);
    }

    Ok(())
}

///
/// Upload batch and chunks
///

const BATCH_EXPIRY_NANOS: u64 = 300_000_000_000;

static mut NEXT_BATCH_ID: u128 = 0;
static mut NEXT_CHUNK_ID: u128 = 0;

pub fn create_batch(caller: Principal, init: InitAssetKey) -> Result<u128, String> {
    let controllers: Controllers = get_controllers();
    secure_create_batch_impl(caller, &controllers, init)
}

pub fn create_chunk(caller: Principal, chunk: UploadChunk) -> Result<u128, &'static str> {
    create_chunk_impl(caller, chunk)
}

pub fn commit_batch(caller: Principal, commit_batch: CommitBatch) -> Result<(), String> {
    let controllers: Controllers = get_controllers();
    commit_batch_impl(caller, &controllers, commit_batch)
}

fn secure_create_batch_impl(
    caller: Principal,
    controllers: &Controllers,
    init: InitAssetKey,
) -> Result<u128, String> {
    let rule = get_state_rule(&init.collection)?;

    if !(public_rule(&rule.write) || is_known_user(caller) || is_controller(caller, controllers)) {
        return Err(UPLOAD_NOT_ALLOWED.to_string());
    }

    assert_key(caller, &init.full_path, &init.collection, controllers)?;

    assert_description_length(&init.description)?;

    // Assert supported encoding type
    get_encoding_type(&init.encoding_type)?;

    Ok(create_batch_impl(caller, init))
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
    UploadChunk {
        batch_id,
        content,
        order_id,
    }: UploadChunk,
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

                insert_runtime_chunk(
                    &NEXT_CHUNK_ID,
                    Chunk {
                        batch_id,
                        content,
                        order_id: order_id.unwrap_or(NEXT_CHUNK_ID),
                    },
                );

                Ok(NEXT_CHUNK_ID)
            }
        }
    }
}

fn commit_batch_impl(
    caller: Principal,
    controllers: &Controllers,
    commit_batch: CommitBatch,
) -> Result<(), String> {
    let batch = get_runtime_batch(&commit_batch.batch_id);

    match batch {
        None => Err(ERROR_CANNOT_COMMIT_BATCH.to_string()),
        Some(b) => {
            let asset = secure_commit_chunks(caller, controllers, commit_batch, &b);
            match asset {
                Err(err) => Err(err),
                Ok(asset) => {
                    update_runtime_certified_asset(&asset);
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

    let rule = get_state_rule(&batch.key.collection)?;

    let current = get_state_asset(&batch.key.full_path, &rule);

    match current {
        None => {
            if !assert_create_rule(&rule.write, caller, controllers) {
                return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
            }

            commit_chunks(commit_batch, batch, &rule)
        }
        Some(current) => {
            secure_commit_chunks_update(caller, controllers, commit_batch, batch, rule, current)
        }
    }
}

fn secure_commit_chunks_update(
    caller: Principal,
    controllers: &Controllers,
    commit_batch: CommitBatch,
    batch: &Batch,
    rule: Rule,
    current: Asset,
) -> Result<Asset, String> {
    // The collection of the existing asset should be the same as the one we commit
    if batch.key.collection != current.key.collection {
        return Err("Provided collection does not match existing collection.".to_string());
    }

    if !assert_rule(&rule.write, current.key.owner, caller, controllers) {
        return Err(ERROR_CANNOT_COMMIT_BATCH.to_string());
    }

    commit_chunks(commit_batch, batch, &rule)
}

fn commit_chunks(
    CommitBatch {
        chunk_ids,
        batch_id,
        headers,
    }: CommitBatch,
    batch: &Batch,
    rule: &Rule,
) -> Result<Asset, String> {
    let now = time();

    if now > batch.expires_at {
        clear_expired_batches();
        return Err("Batch did not complete in time. Chunks cannot be committed.".to_string());
    }

    // Collect all chunks
    let mut chunks: Vec<Chunk> = vec![];

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

                chunks.push(c);
            }
        }
    }

    // Sort with ordering
    chunks.sort_by(|a, b| a.order_id.cmp(&b.order_id));

    let mut content_chunks: Vec<Vec<u8>> = vec![];

    // Collect content
    for c in chunks.iter() {
        content_chunks.push(c.content.clone());
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

    if let Some(existing_asset) = get_state_asset(&batch.clone().key.full_path, rule) {
        asset.encodings = existing_asset.encodings.clone();
        asset.created_at = existing_asset.created_at;
    }

    let encoding_type = get_encoding_type(&batch.encoding_type)?;

    let encoding = AssetEncoding::from(&content_chunks);

    match rule.max_size {
        None => (),
        Some(max_size) => {
            if encoding.total_length > max_size {
                clear_runtime_batch(&batch_id, &chunk_ids);
                return Err("Asset exceed max allowed size.".to_string());
            }
        }
    }

    asset.encodings.insert(encoding_type, encoding);

    insert_state_asset(&batch.clone().key.full_path, &asset, rule);

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
    insert_state_config(config);
}

pub fn get_config() -> StorageConfig {
    get_state_config()
}

///
/// Domain
///

pub fn set_domain(domain_name: &DomainName, bn_id: &Option<String>) -> Result<(), String> {
    set_domain_impl(domain_name, bn_id)
}

pub fn delete_domain(domain_name: &DomainName) -> Result<(), String> {
    delete_domain_impl(domain_name)
}

pub fn get_custom_domains() -> CustomDomains {
    get_state_domains()
}

fn delete_domain_impl(domain_name: &DomainName) -> Result<(), String> {
    delete_state_domain(domain_name);

    update_custom_domains_asset()
}

fn set_domain_impl(domain_name: &DomainName, bn_id: &Option<String>) -> Result<(), String> {
    set_stable_domain_impl(domain_name, bn_id);

    update_custom_domains_asset()
}

fn update_custom_domains_asset() -> Result<(), String> {
    let custom_domains = get_custom_domains_as_content();

    let full_path = BN_WELL_KNOWN_CUSTOM_DOMAINS.to_string();

    // #app collection rule
    let rule = get_rule(&DEFAULT_ASSETS_COLLECTIONS[0].0.to_string())?;

    let existing_asset = get_state_asset(&full_path, &rule);

    let asset = map_custom_domains_asset(&custom_domains, existing_asset);

    insert_state_asset(&full_path, &asset, &rule);

    update_runtime_certified_asset(&asset);

    Ok(())
}

fn set_stable_domain_impl(domain_name: &DomainName, bn_id: &Option<String>) {
    let domain = get_state_domain(domain_name);

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

    insert_state_domain(domain_name, &custom_domain);
}

fn get_custom_domains_as_content() -> String {
    let custom_domains = get_state_domains();

    custom_domains
        .into_keys()
        .collect::<Vec<DomainName>>()
        .join("\n")
}

/// Certified assets

pub fn init_certified_assets() {
    init_runtime_certified_assets();
}
