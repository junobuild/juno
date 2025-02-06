use crate::constants::SYS_COLLECTION_PREFIX;
use crate::types::core::CollectionKey;
use crate::types::interface::SetRule;
use crate::types::rules::{Memory, Rule};
use ic_cdk::api::time;
use junobuild_shared::constants::INITIAL_VERSION;
use junobuild_shared::types::state::{Timestamp, Version, Versioned};
use junobuild_shared::version::next_version;

impl Rule {
    pub fn mem(&self) -> Memory {
        self.memory.clone().unwrap_or_default()
    }

    pub fn prepare(
        collection: &CollectionKey,
        current_rule: &Option<&Rule>,
        user_rule: &SetRule,
    ) -> Result<Self, String> {
        if collection.starts_with(SYS_COLLECTION_PREFIX) {
            return Self::prepare_sys_rule(collection, current_rule, user_rule);
        }

        Ok(Self::prepare_user_rule(current_rule, user_rule))
    }

    fn initialize_common_fields(current_rule: &Option<&Rule>) -> (Timestamp, Version, Timestamp) {
        let now = time();

        let created_at: Timestamp = match current_rule {
            None => now,
            Some(current_rule) => current_rule.created_at,
        };

        let version = next_version(current_rule);

        let updated_at: Timestamp = now;

        (created_at, version, updated_at)
    }

    fn prepare_user_rule(current_rule: &Option<&Rule>, user_rule: &SetRule) -> Self {
        let (created_at, version, updated_at) = Self::initialize_common_fields(current_rule);

        Rule {
            read: user_rule.read.clone(),
            write: user_rule.write.clone(),
            memory: Some(user_rule.clone().memory.unwrap_or(Memory::Stable)),
            mutable_permissions: Some(user_rule.mutable_permissions.unwrap_or(true)),
            max_size: user_rule.max_size,
            max_capacity: user_rule.max_capacity,
            max_changes_per_user: user_rule.max_changes_per_user,
            created_at,
            updated_at,
            version: Some(version),
            rate_config: user_rule.rate_config.clone(),
        }
    }

    fn prepare_sys_rule(
        collection: &CollectionKey,
        current_rule: &Option<&Rule>,
        user_rule: &SetRule,
    ) -> Result<Rule, String> {
        match current_rule {
            None => Err(format!("Collection {} is reserved.", collection)),
            Some(current_rule) => {
                let (created_at, version, updated_at) =
                    Self::initialize_common_fields(&Some(current_rule));

                let rule = Rule {
                    read: current_rule.read.clone(),
                    write: current_rule.write.clone(),
                    memory: current_rule.memory.clone(),
                    mutable_permissions: current_rule.mutable_permissions,
                    max_size: current_rule.max_size,
                    max_capacity: current_rule.max_capacity,
                    max_changes_per_user: current_rule.max_changes_per_user,
                    created_at,
                    updated_at,
                    version: Some(version),
                    rate_config: user_rule.rate_config.clone(),
                };

                Ok(rule)
            }
        }
    }
}

impl Versioned for Rule {
    fn version(&self) -> Option<Version> {
        self.version
    }
}
