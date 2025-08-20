use crate::types::core::Salt;
use ic_certification::Hash;

pub trait AuthCertificateStrategy {
    fn update_certified_data(&self);

    fn get_asset_hashes_root_hash(&self) -> Hash;

    fn salt(&self) -> Option<Salt>;
}
