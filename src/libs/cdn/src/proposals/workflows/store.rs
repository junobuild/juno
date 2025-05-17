use crate::storage::heap::{collect_delete_assets, delete_asset, get_asset, insert_asset};
use crate::strategies::CdnHeapStrategy;
use junobuild_collections::types::core::CollectionKey;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{AssetEncoding, EncodingType};

pub fn insert_asset_encoding(
    cdn_heap: &impl CdnHeapStrategy,
    full_path: &FullPath,
    encoding_type: &EncodingType,
    encoding: &AssetEncoding,
) -> Result<(), String> {
    let mut asset = match get_asset(cdn_heap, full_path) {
        Some(asset) => asset,
        None => return Err(format!("No asset found for {}", full_path)),
    };

    asset
        .encodings
        .insert(encoding_type.to_owned(), encoding.clone());

    insert_asset(cdn_heap, full_path, &asset);

    Ok(())
}

pub fn delete_assets(cdn_heap: &impl CdnHeapStrategy, collection: &CollectionKey) {
    let full_paths = collect_delete_assets(cdn_heap, collection);

    for full_path in full_paths {
        delete_asset(cdn_heap, &full_path);
    }
}
