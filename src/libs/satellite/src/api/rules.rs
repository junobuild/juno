use crate::rules::store::{
    del_rule_db, del_rule_storage, get_rule_db, get_rule_storage, list_rules_db,
    list_rules_storage, set_rule_db, set_rule_storage,
};
use crate::types::state::CollectionType;
use ic_cdk::trap;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::interface::{
    DelRule, ListRulesParams, ListRulesResults, SetRule,
};
use junobuild_collections::types::rules::Rule;

pub fn get_rule(collection_type: &CollectionType, collection: &CollectionKey) -> Option<Rule> {
    match collection_type {
        CollectionType::Db => get_rule_db(collection),
        CollectionType::Storage => get_rule_storage(collection),
    }
}

pub fn list_rules(collection_type: &CollectionType, filter: &ListRulesParams) -> ListRulesResults {
    match collection_type {
        CollectionType::Db => list_rules_db(filter),
        CollectionType::Storage => list_rules_storage(filter),
    }
}

pub fn set_rule(collection_type: CollectionType, collection: CollectionKey, rule: SetRule) -> Rule {
    match collection_type {
        CollectionType::Db => set_rule_db(collection, rule).unwrap_or_else(|e| trap(&e)),
        CollectionType::Storage => set_rule_storage(collection, rule).unwrap_or_else(|e| trap(&e)),
    }
}

pub fn del_rule(collection_type: CollectionType, collection: CollectionKey, rule: DelRule) {
    match collection_type {
        CollectionType::Db => del_rule_db(collection, rule).unwrap_or_else(|e| trap(&e)),
        CollectionType::Storage => del_rule_storage(collection, rule).unwrap_or_else(|e| trap(&e)),
    }
}
