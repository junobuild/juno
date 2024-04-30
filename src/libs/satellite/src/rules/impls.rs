use crate::rules::types::interface::SetRule;
use crate::rules::types::rules::{Memory, Rule};
use ic_cdk::api::time;
use junobuild_shared::types::state::{Timestamp, Version};

impl Rule {
    pub fn mem(&self) -> Memory {
        self.memory.clone().unwrap_or_default()
    }

    pub fn prepare(current_rule: &Option<&Rule>, user_rule: &SetRule) -> Self {
        let now = time();

        let created_at: Timestamp = match current_rule {
            None => now,
            Some(current_rule) => current_rule.created_at,
        };

        let version: Version = match current_rule {
            None => 1,
            Some(current_rule) => current_rule.version.unwrap_or_default() + 1,
        };

        let updated_at: Timestamp = now;

        Rule {
            read: user_rule.read.clone(),
            write: user_rule.write.clone(),
            memory: Some(user_rule.clone().memory.unwrap_or(Memory::Stable)),
            mutable_permissions: Some(user_rule.mutable_permissions.unwrap_or(true)),
            max_size: user_rule.max_size,
            max_capacity: user_rule.max_capacity,
            created_at,
            updated_at,
            version: Some(version),
        }
    }
}
