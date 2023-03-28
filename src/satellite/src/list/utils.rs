use crate::types::core::Compare;
use crate::types::core::Key;
use crate::types::list::{ListOrder, ListOrderField, ListPaginate, ListParams, ListResults};

pub fn list_values<T: Clone + Compare>(
    matches: Vec<(Key, T)>,
    filters: &ListParams,
) -> ListResults<T> {
    let matches_length = matches.len();

    let ordered = order_values(matches, filters);

    let paginated = paginate_values(ordered, filters);

    let length = paginated.len();

    ListResults {
        items: paginated,
        length,
        matches_length,
    }
}

fn order_values<T: Clone + Compare>(
    matches: Vec<(Key, T)>,
    ListParams {
        matcher: _,
        order,
        paginate: _,
        owner: _,
    }: &ListParams,
) -> Vec<(Key, T)> {
    match order {
        None => matches,
        Some(ListOrder { desc, field }) => match field {
            ListOrderField::Keys => order_values_with_keys(matches, desc),
            ListOrderField::UpdatedAt => order_values_with_updated_at(matches, desc),
            ListOrderField::CreatedAt => order_values_with_created_at(matches, desc),
        },
    }
}

fn order_values_with_updated_at<T: Clone + Compare>(
    mut matches: Vec<(Key, T)>,
    desc: &bool,
) -> Vec<(Key, T)> {
    if *desc {
        matches.sort_by(|(_, value_a), (_, value_b)| value_b.cmp_updated_at(value_a));
        return matches;
    }

    matches.sort_by(|(_, value_a), (_, value_b)| value_a.cmp_updated_at(value_b));
    matches
}

fn order_values_with_created_at<T: Clone + Compare>(
    mut matches: Vec<(Key, T)>,
    desc: &bool,
) -> Vec<(Key, T)> {
    if *desc {
        matches.sort_by(|(_, value_a), (_, value_b)| value_b.cmp_created_at(value_a));
        return matches;
    }

    matches.sort_by(|(_, value_a), (_, value_b)| value_a.cmp_created_at(value_b));
    matches
}

fn order_values_with_keys<T: Clone + Compare>(
    mut matches: Vec<(Key, T)>,
    desc: &bool,
) -> Vec<(Key, T)> {
    if *desc {
        matches.sort_by(|(key_a, _), (key_b, _)| key_b.cmp(key_a));
        return matches;
    }

    matches.sort_by(|(key_a, _), (key_b, _)| key_a.cmp(key_b));
    matches
}

fn paginate_values<T: Clone + Compare>(
    matches: Vec<(Key, T)>,
    ListParams {
        matcher: _,
        order: _,
        paginate,
        owner: _,
    }: &ListParams,
) -> Vec<(Key, T)> {
    match paginate {
        None => matches,
        Some(ListPaginate { start_after, limit }) => {
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

            let start = match start_after {
                None => 0,
                Some(start_after) => {
                    let index = matches.iter().position(|(key, _)| key.eq(start_after));
                    match index {
                        None => {
                            return Vec::new();
                        }
                        Some(index) => index + 1,
                    }
                }
            };

            if start > (max - 1) {
                return Vec::new();
            }

            if (start + length) > max - 1 {
                return matches[start..=(max - 1)].to_vec();
            }

            matches[start..=(start + length - 1)].to_vec()
        }
    }
}
