use crate::db::types::state::Doc;
use candid::Principal;
use junobuild_collections::assert::stores::assert_permission;
use junobuild_collections::types::rules::Permission;
use junobuild_shared::list::{filter_timestamps, matcher_regex};
use junobuild_shared::types::core::Key;
use junobuild_shared::types::list::ListParams;
use junobuild_shared::types::state::{Controllers, UserId};
use regex::Regex;

pub fn filter_values<'a>(
    caller: Principal,
    controllers: &'a Controllers,
    rule: &'a Permission,
    col: &'a [(&'a Key, &'a Doc)],
    ListParams {
        matcher,
        order: _,
        paginate: _,
        owner,
    }: &'a ListParams,
) -> Vec<(&'a Key, &'a Doc)> {
    let (regex_key, regex_description) = matcher_regex(matcher);

    col.iter()
        .filter_map(|(key, doc)| {
            if filter_key_matcher(&regex_key, key)
                && filter_description_matcher(&regex_description, &doc.description)
                && filter_owner(owner, &doc.owner)
                && filter_timestamps(matcher, *doc)
                && assert_permission(rule, doc.owner, caller, controllers)
            {
                Some((*key, *doc))
            } else {
                None
            }
        })
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
