use crate::types::core::Key;
use crate::types::list::{ListParams, ListResults, OrderKeys, PaginateKeys};

pub fn list_values<T: Clone>(matches: Vec<(Key, T)>, filters: &ListParams) -> ListResults<T> {
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

fn order_values<T: Clone>(
    mut matches: Vec<(Key, T)>,
    ListParams {
        matcher: _,
        order,
        paginate: _,
    }: &ListParams,
) -> Vec<(Key, T)> {
    match order {
        None => matches,
        Some(OrderKeys { desc }) => {
            if *desc {
                matches.sort_by(|(key_a, _), (key_b, _)| key_b.cmp(key_a));
                return matches;
            }

            matches.sort_by(|(key_a, _), (key_b, _)| key_a.cmp(key_b));
            matches
        }
    }
}

fn paginate_values<T: Clone>(
    matches: Vec<(Key, T)>,
    ListParams {
        matcher: _,
        order: _,
        paginate,
    }: &ListParams,
) -> Vec<(Key, T)> {
    match paginate {
        None => matches,
        Some(PaginateKeys { start_after, limit }) => {
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
