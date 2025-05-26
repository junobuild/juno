use crate::regex::build_regex;
use crate::types::core::Key;
use crate::types::list::{
    ListMatcher, ListOrder, ListOrderField, ListPaginate, ListParams, ListResults, TimestampMatcher,
};
use crate::types::state::Timestamp;
use crate::types::state::Timestamped;
use regex::Regex;

pub fn list_values<'a, T: Clone + Timestamped>(
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

fn start_at<T: Clone + Timestamped>(matches: &[(&Key, &T)], filters: &ListParams) -> Option<usize> {
    match filters.clone().paginate {
        None => None,
        Some(paginate) => match paginate.start_after {
            None => Some(0),
            Some(start_after) => {
                let index = matches
                    .iter()
                    .position(|(key, _)| (*key).clone().eq(&start_after));
                index.map(|index| index + 1)
            }
        },
    }
}

fn order_values<'a, T: Clone + Timestamped>(
    matches: &'a [(&'a Key, &'a T)],
    ListParams {
        matcher: _,
        order,
        paginate: _,
        owner: _,
    }: &'a ListParams,
) -> Vec<(&'a Key, &'a T)> {
    match order {
        None => matches.to_vec(),
        Some(ListOrder { desc, field }) => match field {
            ListOrderField::Keys => order_values_with_keys(matches, desc),
            ListOrderField::UpdatedAt => order_values_with_updated_at(matches, desc),
            ListOrderField::CreatedAt => order_values_with_created_at(matches, desc),
        },
    }
}

fn order_values_with_updated_at<'a, T: Clone + Timestamped>(
    matches: &'a [(&'a Key, &'a T)],
    desc: &bool,
) -> Vec<(&'a Key, &'a T)> {
    let mut sorted_matches = matches.to_vec();

    if *desc {
        sorted_matches.sort_by(|(_, value_a), (_, value_b)| value_b.cmp_updated_at(value_a));
        return sorted_matches;
    }

    sorted_matches.sort_by(|(_, value_a), (_, value_b)| value_a.cmp_updated_at(value_b));
    sorted_matches
}

fn order_values_with_created_at<'a, T: Clone + Timestamped>(
    matches: &'a [(&'a Key, &'a T)],
    desc: &bool,
) -> Vec<(&'a Key, &'a T)> {
    let mut sorted_matches = matches.to_vec();

    if *desc {
        sorted_matches.sort_by(|(_, value_a), (_, value_b)| value_b.cmp_created_at(value_a));
        return sorted_matches;
    }

    sorted_matches.sort_by(|(_, value_a), (_, value_b)| value_a.cmp_created_at(value_b));
    sorted_matches
}

fn order_values_with_keys<'a, T: Clone + Timestamped>(
    matches: &'a [(&'a Key, &'a T)],
    desc: &bool,
) -> Vec<(&'a Key, &'a T)> {
    let mut sorted_matches = matches.to_vec();

    if *desc {
        sorted_matches.sort_by(|(key_a, _), (key_b, _)| key_b.cmp(key_a));
        return sorted_matches;
    }

    sorted_matches.sort_by(|(key_a, _), (key_b, _)| key_a.cmp(key_b));
    sorted_matches
}

fn paginate_values<T: Clone + Timestamped>(
    matches: Vec<(&Key, &T)>,
    ListParams {
        matcher: _,
        order: _,
        paginate,
        owner: _,
    }: &ListParams,
    start_at: &Option<usize>,
) -> Vec<(Key, T)> {
    match paginate {
        None => matches
            .iter()
            .map(|(key, value)| ((*key).clone(), (*value).clone()))
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

            if start.saturating_add(length) > max - 1 {
                return matches[start..=(max - 1)]
                    .iter()
                    .map(|(key, value)| ((*key).clone(), (*value).clone()))
                    .collect();
            }

            matches[start..=(start + length - 1)]
                .iter()
                .map(|(key, value)| ((*key).clone(), (*value).clone()))
                .collect()
        }
    }
}

pub fn matcher_regex(
    matcher: &Option<ListMatcher>,
) -> Result<(Option<Regex>, Option<Regex>), String> {
    let regex_key: Option<Regex> = match matcher {
        None => None,
        Some(matcher) => matcher
            .key
            .as_ref()
            .map(|filter| build_regex(filter))
            .transpose()?,
    };

    let regex_description: Option<Regex> = match matcher {
        None => None,
        Some(matcher) => matcher
            .description
            .as_ref()
            .map(|filter| build_regex(filter))
            .transpose()?,
    };

    Ok((regex_key, regex_description))
}

pub fn filter_timestamps<T: Timestamped>(matcher: &Option<ListMatcher>, item: &T) -> bool {
    if let Some(matcher) = matcher {
        if let Some(ref created_at_filter) = matcher.created_at {
            if !match_timestamp(item.created_at(), created_at_filter) {
                return false;
            }
        }

        if let Some(ref updated_at_filter) = matcher.updated_at {
            if !match_timestamp(item.updated_at(), updated_at_filter) {
                return false;
            }
        }
    }

    true
}

fn match_timestamp(timestamp: Timestamp, filter: &TimestampMatcher) -> bool {
    match filter {
        TimestampMatcher::Equal(ts) => timestamp == *ts,
        TimestampMatcher::GreaterThan(ts) => timestamp > *ts,
        TimestampMatcher::LessThan(ts) => timestamp < *ts,
        TimestampMatcher::Between(start, end) => timestamp >= *start && timestamp <= *end,
    }
}
