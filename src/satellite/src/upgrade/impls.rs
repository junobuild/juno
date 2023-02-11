use crate::storage::types::config::StorageConfig;
use crate::storage::types::domain::CustomDomain;
use crate::storage::types::state::StorageStableState;
use crate::types::state::StableState;
use crate::upgrade::types::upgrade::{UpgradeStableState, UpgradeTrailingSlash};
use std::collections::HashMap;

impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        let mut custom_domains = HashMap::new();

        for (domain_name, custom_domain) in state.storage.custom_domains.clone().into_iter() {
            custom_domains.insert(
                domain_name,
                CustomDomain {
                    updated_at: custom_domain.updated_at,
                    created_at: custom_domain.created_at,
                    bn_id: Some(custom_domain.bn_id),
                },
            );
        }

        StableState {
            controllers: state.controllers.clone(),
            db: state.db.clone(),
            storage: StorageStableState {
                assets: state.storage.assets.clone(),
                rules: state.storage.rules.clone(),
                config: StorageConfig::default(),
                custom_domains,
            },
        }
    }
}

impl Default for UpgradeTrailingSlash {
    fn default() -> Self {
        UpgradeTrailingSlash::Never
    }
}
