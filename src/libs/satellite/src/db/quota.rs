use crate::db::types::state::{DbHeap, DbHeapState, Rates};
use junobuild_collections::constants::USER_COLLECTION_KEY;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::rate::quota::increment_and_assert_rate;
use junobuild_shared::rate::types::{Rate, RateConfig, RateTokens};

pub fn init_rates() -> Rates {
    let mut rates = Rates::new();

    rates.insert(USER_COLLECTION_KEY.to_string(), Rate::default());

    rates
}

pub fn increment_and_assert_doc_rate(
    collection: &CollectionKey,
    rates: &mut Option<Rates>,
) -> Result<(), String> {
    if let Some(rates) = rates {
        if let Some(rate) = rates.get_mut(collection) {
            increment_and_assert_rate(rate)?;
        }
    }

    Ok(())
}

pub fn update_doc_rate_config(collection: &CollectionKey, config: &RateConfig, state: &mut DbHeapState,) {
    let new_rate = Rate {
        config: config.clone(),
        tokens: RateTokens::default(),
    };

    state.rates
        .get_or_insert_with(init_rates)
        .insert(collection.to_string(), new_rate);
}