use crate::db::types::state::{DbHeapState, Doc, StableKey};
use crate::SetDoc;
use candid::Principal;
use ic_cdk::api::time;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_collections::constants::DEFAULT_DB_COLLECTIONS;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::constants::INITIAL_VERSION;
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use junobuild_shared::types::state::Timestamped;
use junobuild_shared::types::state::{Timestamp, UserId, Version};
use std::borrow::Cow;
use std::cmp::Ordering;
use std::collections::{BTreeMap, HashMap};

impl Default for DbHeapState {
    fn default() -> Self {
        let now = time();

        DbHeapState {
            db: HashMap::from(
                DEFAULT_DB_COLLECTIONS
                    .map(|(collection, _rules)| (collection.to_owned(), BTreeMap::new())),
            ),
            rules: HashMap::from(DEFAULT_DB_COLLECTIONS.map(|(collection, rule)| {
                (
                    collection.to_owned(),
                    Rule {
                        read: rule.read,
                        write: rule.write,
                        memory: Some(rule.memory.unwrap_or(Memory::Stable)),
                        mutable_permissions: Some(rule.mutable_permissions.unwrap_or(false)),
                        max_size: rule.max_size,
                        max_capacity: rule.max_capacity,
                        max_changes_per_user: rule.max_changes_per_user,
                        created_at: now,
                        updated_at: now,
                        version: rule.version,
                        rate_config: rule.rate_config,
                    },
                )
            })),
            config: None,
        }
    }
}

impl Timestamped for Doc {
    fn created_at(&self) -> Timestamp {
        self.created_at
    }

    fn updated_at(&self) -> Timestamp {
        self.updated_at
    }

    fn cmp_updated_at(&self, other: &Self) -> Ordering {
        self.updated_at.cmp(&other.updated_at)
    }

    fn cmp_created_at(&self, other: &Self) -> Ordering {
        self.created_at.cmp(&other.created_at)
    }
}

impl Storable for Doc {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for StableKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Doc {
    pub fn prepare(caller: Principal, current_doc: &Option<Doc>, user_doc: SetDoc) -> Self {
        let now = time();

        let created_at: Timestamp = match current_doc {
            None => now,
            Some(current_doc) => current_doc.created_at,
        };

        let version: Version = match current_doc {
            None => INITIAL_VERSION,
            Some(current_doc) => current_doc.version.unwrap_or_default() + 1,
        };

        let owner: UserId = match current_doc {
            None => caller,
            Some(current_doc) => current_doc.owner,
        };

        let updated_at: Timestamp = now;

        Doc {
            owner,
            data: user_doc.data,
            description: user_doc.description,
            created_at,
            updated_at,
            version: Some(version),
        }
    }
}
