pub mod core {
    /// Represents the key or identifier of a collection.
    ///
    /// This type, `CollectionKey`, is an alias for `String`, used to represent the key or identifier of a collection
    /// within the context of various data structures and operations.
    ///
    /// `CollectionKey` is commonly employed as a unique identifier for collections in Rust code.
    pub type CollectionKey = String;
}

pub mod rules {
    use crate::types::core::CollectionKey;
    use candid::CandidType;
    use junobuild_shared::rate::types::RateConfig;
    use junobuild_shared::serializers::deserialize_default_as_true;
    use junobuild_shared::types::state::Timestamp;
    use junobuild_shared::types::state::Version;
    use serde::{Deserialize, Serialize};
    use std::collections::HashMap;

    pub type Rules = HashMap<CollectionKey, Rule>;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Rule {
        pub read: Permission,
        pub write: Permission,
        #[serde(default = "deserialize_default_as_true")]
        pub mutable_permissions: Option<bool>,
        pub memory: Option<Memory>,
        pub max_size: Option<u128>,
        pub max_capacity: Option<u32>,
        pub max_changes_per_user: Option<u32>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
        pub rate_config: Option<RateConfig>,
    }

    #[derive(CandidType, Serialize, Deserialize, Default, Clone, PartialEq)]
    pub enum Memory {
        // Backwards compatibility. Version of the Satellite <= v0.0.11 had no memory information and we originally introduced the option with Heap as default.
        // If we set Stable as default, the state won't resolve the information correctly given that we use memory.clone().unwrap_or_default() to select which type of memory to read in the Datastore.
        // We can potentially migrate the collections but, keeping it that way is a pragmatic solution given that even if set as optional, a rule must be set when creating a new collection.
        #[default]
        Heap,
        Stable,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq)]
    pub enum Permission {
        // No rules applied
        Public,
        // The one - and only the one - that created the document can rule it
        Private,
        // The one that created the document and the controllers can rule the document
        Managed,
        // The controllers - and only these - can rule the document
        Controllers,
    }
}

pub mod interface {
    use crate::types::core::CollectionKey;
    use crate::types::rules::{Memory, Permission, Rule};
    use candid::CandidType;
    use junobuild_shared::rate::types::RateConfig;
    use junobuild_shared::types::state::Version;
    use serde::Deserialize;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SetRule {
        pub read: Permission,
        pub write: Permission,
        pub mutable_permissions: Option<bool>,
        pub memory: Option<Memory>,
        pub max_size: Option<u128>,
        pub max_capacity: Option<u32>,
        pub max_changes_per_user: Option<u32>,
        pub version: Option<Version>,
        pub rate_config: Option<RateConfig>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct DelRule {
        pub version: Option<Version>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListRulesParams {
        pub matcher: Option<ListRulesMatcher>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListRulesMatcher {
        pub include_system: bool,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct ListRulesResults {
        pub items: Vec<(CollectionKey, Rule)>,
        pub items_length: usize,
        pub matches_length: usize,
    }
}
