use crate::db::types::state::Doc;
use crate::list::utils::matcher_regex;
use crate::rules::assert_stores::assert_permission;
use crate::rules::types::rules::Permission;
use crate::types::core::Key;
use crate::types::list::ListParams;
use candid::Principal;
use regex::Regex;
use shared::types::state::{Controllers, UserId};

pub fn filter_values(
    caller: Principal,
    controllers: &Controllers,
    rule: &Permission,
    col: &[(Key, Doc)],
    ListParams {
        matcher,
        order: _,
        paginate: _,
        owner,
    }: &ListParams,
) -> Vec<(Key, Doc)> {
    let (regex_key, regex_description) = matcher_regex(matcher);

    col.iter()
        .filter(|(key, doc)| {
            filter_key_matcher(&regex_key, key)
                && filter_description_matcher(&regex_description, &doc.description)
                && filter_owner(owner, &doc.owner)
                && assert_permission(rule, doc.owner, caller, controllers)
        })
        .map(|(key, doc)| (key.clone(), doc.clone()))
        .collect()
}

fn filter_key_matcher(regex: &Option<Regex>, key: &Key) -> bool {
    match regex {
        None => true,
        Some(re) => re.is_match(key),
    }
}

fn filter_description_matcher(regex: &Option<Regex>, description: &Option<String>) -> bool {
    match regex {
        None => true,
        Some(re) => match description {
            None => false,
            Some(description) => re.is_match(description),
        },
    }
}

fn filter_owner(owner: &Option<UserId>, doc_owner: &UserId) -> bool {
    match owner {
        None => true,
        Some(filter_owner) => filter_owner == doc_owner,
    }
}
