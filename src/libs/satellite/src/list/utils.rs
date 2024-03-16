use crate::types::core::{CollectionKey, Compare};
use crate::types::core::{Key, Keyed};
use crate::types::list::{
    ListMatcher, ListOrder, ListOrderField, ListPaginate, ListParams, ListResults,
};
use regex::Regex;

pub fn list_values<'a, T: Clone + Compare>(
    matches: &'a [(&'a Key, &'a T)],
    filters: &'a ListParams,
) -> ListResults<T> {
    let matches_length = matches.len();

    let ordered = order_values(matches, filters);

    let start = start_at(&ordered, filters);

    let paginated = paginate_values(ordered, filters, &start);

    let length = paginated.len();

    ListResults {
        items: paginated,
        items_length: length,
        matches_length,
        items_page: current_page(start, filters),
        matches_pages: total_pages(matches_length, filters),
    }
}

pub fn list_keyed_values<'a, I, T, K>(matches_iter: I, filters: &'a ListParams) -> ListResults<T>
where
    I: Iterator<Item = (K, T)> + 'a,
    T: Clone + Compare + 'a,
    K: Keyed + 'a,
{
    let matches: Vec<(K, T)> = matches_iter.collect();
    let matches_length = matches.len();

    // TODO: we collected the matches, can we keep a box further?
    let matches_refs: Vec<(&K, &T)> = matches.iter().map(|(k, t)| (k, t)).collect();

    let ordered = order_values(&matches_refs[..], filters);

    let start = start_at(&ordered, filters);

    let paginated = paginate_values(ordered, filters, &start);

    let length = paginated.len();

    ListResults {
        items: paginated,
        items_length: length,
        matches_length,
        items_page: current_page(start, filters),
        matches_pages: total_pages(matches_length, filters),
    }
}

fn current_page(start_at: Option<usize>, filters: &ListParams) -> Option<usize> {
    match start_at {
        None => None,
        Some(start_at) => match filters.clone().paginate {
            None => None,
            Some(paginate) => paginate.limit.map(|limit| start_at / limit),
        },
    }
}

fn total_pages(matches_length: usize, filters: &ListParams) -> Option<usize> {
    match filters.clone().paginate {
        None => None,
        Some(paginate) => paginate.limit.map(|limit| matches_length / limit),
    }
}

fn start_at<K, T>(matches: &[(&K, &T)], filters: &ListParams) -> Option<usize>
where
    K: Keyed,
    T: Clone + Compare,
{
    match filters.clone().paginate {
        None => None,
        Some(paginate) => match paginate.start_after {
            None => Some(0),
            Some(start_after) => {
                let index = matches
                    .iter()
                    .position(|(key, _)| (*key.key_ref()).clone().eq(&start_after));
                index.map(|index| index + 1)
            }
        },
    }
}

fn order_values<'a, K, T>(
    matches: &'a [(&'a K, &'a T)],
    ListParams {
        matcher: _,
        order,
        paginate: _,
        owner: _,
    }: &'a ListParams,
) -> Vec<(&'a K, &'a T)>
where
    K: Keyed + 'a,
    T: Clone + Compare + 'a,
{
    match order {
        None => matches.to_vec(),
        Some(ListOrder { desc, field }) => match field {
            ListOrderField::Keys => order_values_with_keys(matches, desc),
            ListOrderField::UpdatedAt => order_values_with_updated_at(matches, desc),
            ListOrderField::CreatedAt => order_values_with_created_at(matches, desc),
        },
    }
}

fn order_values_with_updated_at<'a, K, T>(
    matches: &'a [(&'a K, &'a T)],
    desc: &bool,
) -> Vec<(&'a K, &'a T)>
where
    K: Keyed + 'a,
    T: Clone + Compare + 'a,
{
    let mut sorted_matches = matches.to_vec();

    if *desc {
        sorted_matches.sort_by(|(_, value_a), (_, value_b)| value_b.cmp_updated_at(value_a));
        return sorted_matches;
    }

    sorted_matches.sort_by(|(_, value_a), (_, value_b)| value_a.cmp_updated_at(value_b));
    sorted_matches
}

fn order_values_with_created_at<'a, K, T>(
    matches: &'a [(&'a K, &'a T)],
    desc: &bool,
) -> Vec<(&'a K, &'a T)>
where
    K: Keyed + 'a,
    T: Clone + Compare + 'a,
{
    let mut sorted_matches = matches.to_vec();

    if *desc {
        sorted_matches.sort_by(|(_, value_a), (_, value_b)| value_b.cmp_created_at(value_a));
        return sorted_matches;
    }

    sorted_matches.sort_by(|(_, value_a), (_, value_b)| value_a.cmp_created_at(value_b));
    sorted_matches
}

fn order_values_with_keys<'a, K, T>(
    matches: &'a [(&'a K, &'a T)],
    desc: &bool,
) -> Vec<(&'a K, &'a T)>
where
    K: Keyed + 'a,
    T: Clone + Compare + 'a,
{
    let mut sorted_matches = matches.to_vec();

    if *desc {
        sorted_matches.sort_by(|(key_a, _), (key_b, _)| key_b.key_ref().cmp(key_a.key_ref()));
        return sorted_matches;
    }

    sorted_matches.sort_by(|(key_a, _), (key_b, _)| key_a.key_ref().cmp(key_b.key_ref()));
    sorted_matches
}

fn paginate_values<K, T>(
    matches: Vec<(&K, &T)>,
    ListParams {
        matcher: _,
        order: _,
        paginate,
        owner: _,
    }: &ListParams,
    start_at: &Option<usize>,
) -> Vec<(Key, T)>
where
    K: Keyed,
    T: Clone + Compare,
{
    match paginate {
        None => matches
            .iter()
            .map(|(key, value)| ((*key.key_ref()).clone(), (*value).clone()))
            .collect(),
        Some(ListPaginate {
            start_after: _,
            limit,
        }) => {
            let max: usize = matches.len();

            if max == 0 {
                return Vec::new();
            }

            let length = match limit {
                None => max,
                Some(limit) => {
                    if *limit > max {
                        max
                    } else {
                        *limit
                    }
                }
            };

            let start = match *start_at {
                None => {
                    return Vec::new();
                }
                Some(start_at) => start_at,
            };

            if start > (max - 1) {
                return Vec::new();
            }

            if (start + length) > max - 1 {
                return matches[start..=(max - 1)]
                    .iter()
                    .map(|(key, value)| ((*key.key_ref()).clone(), (*value).clone()))
                    .collect();
            }

            matches[start..=(start + length - 1)]
                .iter()
                .map(|(key, value)| ((*key.key_ref()).clone(), (*value).clone()))
                .collect()
        }
    }
}

pub fn matcher_regex(matcher: &Option<ListMatcher>) -> (Option<Regex>, Option<Regex>) {
    let regex_key: Option<Regex> = match matcher {
        None => None,
        Some(matcher) => matcher
            .key
            .as_ref()
            .map(|filter| Regex::new(filter).unwrap()),
    };

    let regex_description: Option<Regex> = match matcher {
        None => None,
        Some(matcher) => matcher
            .description
            .as_ref()
            .map(|filter| Regex::new(filter).unwrap()),
    };

    (regex_key, regex_description)
}

pub fn range_collection_end(collection: &CollectionKey) -> CollectionKey {
    // Source: https://github.com/frederikrothenberger
    // 0u8 shall be use until char::MIN get standardized
    let mut end_collection: String = collection.clone();
    end_collection.push(char::from(0u8));

    end_collection
}
