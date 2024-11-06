use crate::db::types::state::Rates;
use junobuild_collections::constants::USER_COLLECTION_KEY;
use junobuild_shared::rate::types::Rate;

pub fn init_rates() -> Rates {
    let mut rates = Rates::new();

    rates.insert(USER_COLLECTION_KEY.to_string(), Rate::default());

    rates
}
