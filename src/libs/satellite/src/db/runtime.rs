use crate::db::types::state::RateCollectionTokens;
use crate::memory::STATE;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::rate::quota::increment_and_assert_rate as increment_and_assert_rate_shared;
use junobuild_shared::rate::types::{RateConfig, RateTokens};

///
/// Rates
///

pub fn increment_and_assert_rate(
    collection: &CollectionKey,
    config: &Option<RateConfig>,
) -> Result<(), String> {
    STATE.with(|state| {
        increment_and_assert_rate_impl(
            collection,
            config,
            &mut state.borrow_mut().runtime.db.rate_tokens,
        )
    })
}

fn increment_and_assert_rate_impl(
    collection: &CollectionKey,
    config: &Option<RateConfig>,
    rate_tokens: &mut RateCollectionTokens,
) -> Result<(), String> {
    let config = match config {
        Some(config) => config,
        None => return Ok(()),
    };

    if let Some(tokens) = rate_tokens.get_mut(collection) {
        increment_and_assert_rate_shared(config, tokens)?;
    } else {
        rate_tokens.insert(collection.clone(), RateTokens::default());
    }

    Ok(())
}
