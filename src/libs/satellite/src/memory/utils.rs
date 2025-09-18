use crate::assets::constants::{
    CDN_JUNO_RELEASES_COLLECTION_KEY, COLLECTION_RELEASES_DEFAULT_RULE,
};
use junobuild_collections::constants::assets::{
    COLLECTION_ASSET_DEFAULT_RULE, COLLECTION_ASSET_KEY,
};
use junobuild_collections::types::interface::SetRule;
use junobuild_collections::types::rules::Memory;
use junobuild_shared::types::interface::{InitStorageArgs, InitStorageMemory};
use junobuild_storage::types::state::StorageHeapState;

pub fn init_storage_heap_state(storage_args: &Option<InitStorageArgs>) -> StorageHeapState {
    let mut collections = Vec::with_capacity(2);

    collections.extend_from_slice(&build_rule(
        storage_args,
        COLLECTION_ASSET_KEY,
        COLLECTION_ASSET_DEFAULT_RULE,
    ));
    collections.extend_from_slice(&build_rule(
        storage_args,
        CDN_JUNO_RELEASES_COLLECTION_KEY,
        COLLECTION_RELEASES_DEFAULT_RULE,
    ));

    StorageHeapState::new_with_storage_collections(collections)
}

fn build_rule(
    storage_args: &Option<InitStorageArgs>,
    key: &'static str,
    default_rule: SetRule,
) -> [(&'static str, SetRule); 1] {
    let memory = storage_args
        .as_ref()
        .and_then(|args| {
            args.system_memory.as_ref().map(|memory| match memory {
                InitStorageMemory::Heap => Memory::Heap,
                InitStorageMemory::Stable => Memory::Stable,
            })
        })
        .or(default_rule.memory);

    let rule = SetRule {
        memory,
        ..default_rule
    };

    [(key, rule)]
}
