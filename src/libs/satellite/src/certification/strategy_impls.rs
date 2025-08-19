use crate::certification::cert::update_certified_data;
use ic_certification::Hash;
use junobuild_auth::strategies::AuthCertificateStrategy;
use junobuild_storage::runtime::certified_assets_root_hash;
use junobuild_storage::strategies::StorageCertificateStrategy;

pub struct AuthCertificate;

impl AuthCertificateStrategy for AuthCertificate {
    fn update_certified_data(&self) {
        update_certified_data()
    }

    fn get_asset_hashes_root_hash(&self) -> Hash {
        certified_assets_root_hash()
    }
}

pub struct StorageCertificate;

impl StorageCertificateStrategy for StorageCertificate {
    fn update_certified_data(&self) {
        update_certified_data()
    }
}
