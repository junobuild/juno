use crate::rules::constants::DEFAULT_ASSETS_COLLECTIONS;
use crate::rules::types::rules::{Rule, Rules};
use crate::storage::types::state::StorageStableState;
use crate::types::state::StableState;
use crate::upgrade::types::upgrade::UpgradeStableState;
use ic_cdk::api::time;
use std::collections::HashMap;

///
/// v0.0.4 -> v0.0.5
///
/// - #dapp collections read permission can be set as controllers now that the CLI and beta has started
///
///
impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        let mut rules: Rules = HashMap::new();

        let dapp_collection = DEFAULT_ASSETS_COLLECTIONS[0].0;
        let dapp_rule = DEFAULT_ASSETS_COLLECTIONS[0].1.clone();

        let now = time();

        for (key, rule) in state.storage.rules.iter() {
            if key != dapp_collection {
                rules.insert(key.clone(), rule.clone());
            } else {
                rules.insert(
                    dapp_collection.to_owned(),
                    Rule {
                        read: dapp_rule.read.clone(),
                        write: dapp_rule.write.clone(),
                        max_size: None,
                        created_at: rule.created_at,
                        updated_at: now,
                    },
                );
            }
        }

        StableState {
            controllers: state.controllers.clone(),
            db: state.db.clone(),
            storage: StorageStableState {
                assets: state.storage.assets.clone(),
                rules: rules.clone(),
                config: state.storage.config.clone(),
                custom_domains: state.storage.custom_domains.clone(),
            },
        }
    }
}
