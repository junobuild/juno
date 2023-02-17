use crate::rules::constants::DEFAULT_ASSETS_COLLECTIONS;
use crate::storage::types::config::StorageConfig;
use crate::storage::types::state::{Assets, StorageStableState};
use crate::storage::types::store::{Asset, AssetKey};
use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;
use std::collections::HashMap;

///
/// v0.0.3 -> v0.0.4
///
/// - users assets must be prefixed by their respective collections
///   e.g. /yolo.jpg in collection images => /images/yolo.jpg
///
///
impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        let mut assets: Assets = HashMap::new();

        let dapp_collection = DEFAULT_ASSETS_COLLECTIONS[0].0;

        for (key, asset) in state.storage.assets.iter() {
            if asset.key.collection != dapp_collection
                && !key.starts_with(&["/", &asset.key.collection.clone(), "/"].join(""))
            {
                let full_path = ["/", &asset.key.collection.clone(), &key.clone()].join("");

                let upgrade_asset = Asset {
                    key: AssetKey {
                        full_path: full_path.clone(),
                        collection: asset.key.collection.clone(),
                        owner: asset.key.owner,
                        token: asset.key.token.clone(),
                        name: asset.key.name.clone(),
                    },
                    headers: asset.headers.clone(),
                    updated_at: asset.updated_at,
                    created_at: asset.created_at,
                    encodings: asset.encodings.clone(),
                };

                assets.insert(full_path, upgrade_asset);
            } else {
                assets.insert(key.clone(), asset.clone());
            }
        }

        StableState {
            controllers: state.controllers.clone(),
            db: state.db.clone(),
            storage: StorageStableState {
                assets,
                rules: state.storage.rules.clone(),
                config: StorageConfig::default(),
                custom_domains: state.storage.custom_domains.clone(),
            },
        }
    }
}
