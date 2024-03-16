use crate::db::types::state::{Doc};
use crate::list::utils::matcher_regex;
use crate::rules::assert_stores::assert_permission;
use crate::rules::types::rules::Permission;
use crate::types::core::{Key, Keyed};
use crate::types::list::ListParams;
use candid::Principal;
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
                && assert_permission(rule, doc.owner, caller, controllers)
            {
                Some((*key, *doc))
            } else {
                None
            }
        })
        .collect()
}

pub fn filter_keyed_values<'a, I, K>(
    caller: Principal,
    controllers: &'a Controllers,
    rule: &'a Permission,
    col: I,
    ListParams {
        matcher,
        order: _,
        paginate: _,
        owner,
    }: &'a ListParams,
) -> Box<dyn Iterator<Item = (K, Doc)> + 'a>
where
    I: Iterator<Item = (K, Doc)> + 'a,
    K: Keyed + 'a,
{
    let (regex_key, regex_description) = matcher_regex(matcher);

    let filtered_iter = col.filter(move |(key, doc)| {
        filter_key_matcher(&regex_key, key.key_ref())
            && filter_description_matcher(&regex_description, &doc.description)
            && filter_owner(owner, &doc.owner)
            && assert_permission(rule, doc.owner, caller, controllers)
    });

    Box::new(filtered_iter)
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
