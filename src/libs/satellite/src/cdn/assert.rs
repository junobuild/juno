use crate::cdn::constants::{CDN_JUNO_COLLECTION_KEY, CDN_JUNO_COLLECTION_PATH};
use candid::Principal;
use junobuild_cdn::storage::errors::{
    JUNO_CDN_STORAGE_ERROR_INVALID_COLLECTION, JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH,
};
use junobuild_collections::assert::stores::{
    assert_create_permission_with, assert_permission_with,
};
use junobuild_collections::constants::assets::COLLECTION_ASSET_KEY;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Permission;
use junobuild_shared::controllers::{controller_can_write, is_controller};
use junobuild_shared::regex::build_regex;
use junobuild_shared::types::state::Controllers;
use junobuild_storage::types::state::FullPath;

// TODO: storage module uses cdn because of this reference. Refactor modules.

pub fn assert_cdn_asset_keys(
    full_path: &FullPath,
    collection: &CollectionKey,
) -> Result<(), String> {
    match collection.as_str() {
        CDN_JUNO_COLLECTION_KEY => assert_releases_keys(full_path),
        _ => {
            if full_path.starts_with(CDN_JUNO_COLLECTION_PATH) {
                return Err(format!(
                    "{} ({} - {})",
                    JUNO_CDN_STORAGE_ERROR_INVALID_COLLECTION, full_path, collection
                ));
            }

            Ok(())
        }
    }
}

fn assert_releases_keys(full_path: &FullPath) -> Result<(), String> {
    let re = build_regex(r"^/_juno/releases/satellite[^/]*\.wasm\.gz$")?;

    if !re.is_match(full_path) {
        return Err(format!(
            "{} ({})",
            JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH, full_path
        ));
    }

    Ok(())
}

pub fn assert_cdn_write_on_dapp_collection(caller: Principal, controllers: &Controllers) -> bool {
    // When using proposals, we allow any controllers to upload - submit - an asset to be served from #dapp collection
    is_controller(caller, controllers)
}

pub fn assert_cdn_write_on_system_collection(
    caller: Principal,
    collection: &CollectionKey,
    controllers: &Controllers,
) -> bool {
    // Only controllers with scope "Admin" or "Write" can write in reserved collections starting with #
    // ...unless the collection is #_juno and the controller is "Submit".
    if collection == CDN_JUNO_COLLECTION_KEY {
        return is_controller(caller, controllers);
    }

    controller_can_write(caller, controllers)
}

pub fn assert_cdn_create_permission(
    permission: &Permission,
    caller: Principal,
    collection: &CollectionKey,
    controllers: &Controllers,
) -> bool {
    // Through a proposal, any controller - including "Submit" - can provide an asset for the #_juno or #dapp collections.
    if collection == CDN_JUNO_COLLECTION_KEY || collection == COLLECTION_ASSET_KEY {
        return assert_create_permission_with(permission, caller, controllers, is_controller);
    }

    assert_create_permission_with(permission, caller, controllers, controller_can_write)
}

pub fn assert_cdn_update_permission(
    permission: &Permission,
    owner: Principal,
    caller: Principal,
    collection: &CollectionKey,
    controllers: &Controllers,
) -> bool {
    // Through a proposal, any controller - including "Submit" - can provide an update of an asset for the #_juno or #dapp collections.
    if collection == CDN_JUNO_COLLECTION_KEY || collection == COLLECTION_ASSET_KEY {
        return assert_permission_with(permission, caller, owner, controllers, is_controller);
    }

    assert_permission_with(permission, caller, owner, controllers, controller_can_write)
}
