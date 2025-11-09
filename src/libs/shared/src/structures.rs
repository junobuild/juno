use ic_stable_structures::btreemap::{BTreeMap, Iter};
use ic_stable_structures::{Memory, Storable};
use std::collections::HashMap;

/// Collects entries from a stable `BTreeMap` iterator into a `Vec<(K, V)>`.
///
/// This is useful when working with `ic-stable-structures`'s `BTreeMap`
/// and you want to extract all entries as a vector of key-value pairs.
///
/// # Type Parameters
/// - `K`: The key type, which must be `Storable`, `Clone`, and `Ord`.
/// - `V`: The value type, which must be `Storable` and `Clone`.
/// - `M`: The memory backend, which must implement the `Memory` trait.
///
/// # Arguments
/// - `iter`: An iterator over the entries of a stable `BTreeMap`.
///
/// # Returns
/// A vector containing `(K, V)` pairs.
///
/// # Example (using `iter`)
/// ```
/// let vec = collect_stable_vec(my_stable_map.iter());
/// ```
///
/// # Example (using `range`)
/// ```
/// let range = my_stable_map.range(2..3);
/// let entries = collect_stable_vec(range);
/// ```
pub fn collect_stable_vec<K, V, M>(iter: Iter<'_, K, V, M>) -> Vec<(K, V)>
where
    K: Storable + Clone + Ord,
    V: Storable + Clone,
    M: Memory,
{
    iter.map(|entry| (entry.key().clone(), entry.value().clone()))
        .collect()
}

/// Collects entries from a stable `BTreeMap` iterator into a `HashMap<K, V>`.
///
/// This helper is useful when converting from a stable structure
/// (like `BTreeMap<K, V, M>`) to an in-memory `HashMap`.
///
/// # Type Parameters
/// - `K`: The key type, which must be `Storable`, `Clone`, `Ord`, `Eq`, and `Hash`.
/// - `V`: The value type, which must be `Storable` and `Clone`.
/// - `M`: The memory backend, which must implement the `Memory` trait.
///
/// # Arguments
/// - `iter`: An iterator over the entries of a stable `BTreeMap`.
///
/// # Returns
/// A `HashMap<K, V>` containing the collected entries.
///
/// # Example (using `iter`)
/// ```
/// let map = collect_stable_map(my_stable_map.iter());
/// ```
///
/// # Example (using `range`)
/// ```
/// let range = my_stable_map.range(2..3);
/// let entries = collect_stable_map(range);
/// ```
pub fn collect_stable_map<K, V, M>(iter: Iter<'_, K, V, M>) -> HashMap<K, V>
where
    K: Storable + Clone + Eq + Ord + std::hash::Hash,
    V: Storable + Clone,
    M: Memory,
{
    iter.map(|entry| (entry.key().clone(), entry.value().clone()))
        .collect()
}

/// Collects entries from a `BTreeMap` into a `Vec<(K, V)>`.
///
/// This is a convenience wrapper over [`collect_stable_vec`] that calls `.iter()` for you.
///
/// # Type Parameters
/// - `K`: Key type (must be `Storable`, `Clone`, and `Ord`)
/// - `V`: Value type (must be `Storable` and `Clone`)
/// - `M`: Stable memory backend
///
/// # Example
/// ```ignore
/// let vec = collect_stable_vec_from(&my_stable_map);
/// ```
pub fn collect_stable_vec_from<K, V, M>(map: &BTreeMap<K, V, M>) -> Vec<(K, V)>
where
    K: Storable + Clone + Ord,
    V: Storable + Clone,
    M: Memory,
{
    collect_stable_vec(map.iter())
}

/// Collects entries from a `BTreeMap` into a `HashMap<K, V>`.
///
/// This is a convenience wrapper over [`collect_stable_map`] that calls `.iter()` for you.
///
/// # Type Parameters
/// - `K`: Key type (must be `Storable`, `Clone`, `Ord`, `Eq`, `Hash`)
/// - `V`: Value type (must be `Storable` and `Clone`)
/// - `M`: Stable memory backend
///
/// # Example
/// ```ignore
/// let map = collect_stable_map_from(&my_stable_map);
/// ```
pub fn collect_stable_map_from<K, V, M>(map: &BTreeMap<K, V, M>) -> HashMap<K, V>
where
    K: Storable + Clone + Eq + Ord + std::hash::Hash,
    V: Storable + Clone,
    M: Memory,
{
    collect_stable_map(map.iter())
}
