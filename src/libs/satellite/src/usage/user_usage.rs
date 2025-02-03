use crate::types::state::CollectionType;
use crate::usage::state::set_user_usage;
use crate::usage::types::state::UserUsage;
use crate::usage::utils::is_storage_collection_no_usage;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::UserId;

pub fn set_storage_usage(
    collection: &CollectionKey,
    user_id: &UserId,
    count: u32,
) -> Result<UserUsage, String> {
    if is_storage_collection_no_usage(collection) {
        return Err(format!(
            "Storage usage is not recorded for collection {}.",
            collection
        ));
    }

    let usage = set_user_usage(collection, &CollectionType::Storage, user_id, count);

    Ok(usage)
}
