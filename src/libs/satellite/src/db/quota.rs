use crate::db::types::state::Rates;
use junobuild_collections::constants::USER_COLLECTION_KEY;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::rate::quota::increment_and_assert_rate;
use junobuild_shared::rate::types::Rate;

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
