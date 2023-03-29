use crate::db::types::state::{Collection, Doc};
use crate::rules::types::rules::Permission;
use crate::rules::utils::assert_rule;
use crate::types::core::Key;
use crate::types::list::ListParams;
use candid::Principal;
use regex::Regex;
use shared::types::state::{Controllers, UserId};

pub fn filter_values(
    caller: Principal,
    controllers: &Controllers,
    rule: &Permission,
    col: &Collection,
    ListParams {
        matcher,
        order: _,
        paginate: _,
        owner,
    }: &ListParams,
) -> Vec<(Key, Doc)> {
    let regex: Option<Regex> = matcher.as_ref().map(|filter| Regex::new(filter).unwrap());

    col.iter()
        .filter(|(key, doc)| {
            filter_matcher(&regex, key)
                && filter_owner(owner, &doc.owner)
                && assert_rule(rule, doc.owner, caller, controllers)
        })
        .map(|(key, doc)| (key.clone(), doc.clone()))
        .collect()
}

fn filter_matcher(regex: &Option<Regex>, key: &Key) -> bool {
    match regex {
        None => true,
        Some(re) => re.is_match(key),
    }
}

fn filter_owner(owner: &Option<UserId>, doc_owner: &UserId) -> bool {
    match owner {
        None => true,
        Some(filter_owner) => filter_owner == doc_owner,
    }
}
