pub mod rules {
    use crate::types::core::CollectionKey;
    use candid::CandidType;
    use serde::{Deserialize, Serialize};
    use shared::serializers::deserialize_default_as_true;
    use std::collections::HashMap;

    pub type Rules = HashMap<CollectionKey, Rule>;

    #[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct Rule {
        pub read: Permission,
        pub write: Permission,
        #[serde(default = "deserialize_default_as_true")]
        pub mutable_permissions: Option<bool>,
        pub memory: Option<Memory>,
        pub max_size: Option<u128>,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(CandidType, Serialize, Deserialize, Default, Clone, Debug)]
    pub enum Memory {
        #[default]
        Heap,
        Stable,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
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
    use crate::rules::types::rules::{Memory, Permission};
    use candid::CandidType;
    use serde::Deserialize;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct SetRule {
        pub updated_at: Option<u64>,
        pub read: Permission,
        pub write: Permission,
        pub mutable_permissions: Option<bool>,
        pub memory: Option<Memory>,
        pub max_size: Option<u128>,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct DelRule {
        pub updated_at: Option<u64>,
    }
}
