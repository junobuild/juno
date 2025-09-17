use crate::storage::heap::state::{collect_delete_assets, delete_asset, get_asset, insert_asset};
use crate::strategies::CdnHeapStrategy;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Memory;
use junobuild_shared::list::list_values;
use junobuild_shared::types::list::{ListParams, ListResults};
use junobuild_storage::heap_utils::collect_assets_heap;
use junobuild_storage::types::interface::AssetNoContent;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding, EncodingType};
use junobuild_storage::utils::{
    get_token_protected_asset, insert_encoding_into_asset, map_asset_no_content,
};

// ---------------------------------------------------------
// Assets
// ---------------------------------------------------------

pub fn list_assets(
    cdn_heap: &impl CdnHeapStrategy,
    collection: &CollectionKey,
    filters: &ListParams,
) -> ListResults<AssetNoContent> {
    cdn_heap.with_assets(|assets| {
        let assets = collect_assets_heap(collection, assets);
        list_assets_impl(&assets, filters)
    })
}

fn list_assets_impl(
    assets: &[(&FullPath, &Asset)],
    filters: &ListParams,
) -> ListResults<AssetNoContent> {
    let values = list_values(assets, filters);

    ListResults::<AssetNoContent> {
        items: values
            .items
            .into_iter()
            .map(|(_, asset)| map_asset_no_content(&asset))
            .collect(),
        items_length: values.items_length,
        items_page: values.items_page,
        matches_length: values.matches_length,
        matches_pages: values.matches_pages,
    }
}

pub fn get_public_asset(
    cdn_heap: &impl CdnHeapStrategy,
    full_path: FullPath,
    token: Option<String>,
) -> Option<(Asset, Memory)> {
    let asset = get_asset(cdn_heap, &full_path);

    match asset {
        None => None,
        Some(asset) => match &asset.key.token {
            None => Some((asset.clone(), Memory::Heap)),
            Some(asset_token) => {
                let protected_asset = get_token_protected_asset(&asset, asset_token, token);
                protected_asset.map(|protected_asset| (protected_asset, Memory::Heap))
            }
        },
    }
}

pub fn insert_asset_encoding(
    cdn_heap: &impl CdnHeapStrategy,
    full_path: &FullPath,
    encoding_type: &EncodingType,
    encoding: &AssetEncoding,
) -> Result<(), String> {
    let mut asset = match get_asset(cdn_heap, full_path) {
        Some(asset) => asset,
        None => return Err(format!("No asset found for {full_path}")),
    };

    insert_encoding_into_asset(encoding_type, encoding, &mut asset);

    insert_asset(cdn_heap, full_path, &asset);

    Ok(())
}

pub fn delete_assets(cdn_heap: &impl CdnHeapStrategy, collection: &CollectionKey) {
    let full_paths = collect_delete_assets(cdn_heap, collection);

    for full_path in full_paths {
        delete_asset(cdn_heap, &full_path);
    }
}
