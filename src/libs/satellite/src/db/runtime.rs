use crate::memory::internal::STATE;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::rate::types::RateConfig;
use junobuild_shared::rate::utils::increment_and_assert_rate_store;

// ---------------------------------------------------------
// Rates
// ---------------------------------------------------------

pub fn increment_and_assert_rate(
    collection: &CollectionKey,
    config: &Option<RateConfig>,
) -> Result<(), String> {
    STATE.with(|state| {
        increment_and_assert_rate_store(
            collection,
            config,
            &mut state.borrow_mut().runtime.db.rate_tokens,
        )
    })
}
