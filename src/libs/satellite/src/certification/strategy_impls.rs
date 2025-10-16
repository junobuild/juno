use crate::certification::cert::update_certified_data;
use ic_certification::{Hash, HashTree};
use junobuild_auth::state::pruned_labeled_sigs_root_hash_tree;
use junobuild_auth::strategies::AuthCertificateStrategy;
use junobuild_storage::runtime::certified_assets_root_hash;
use junobuild_storage::strategies::StorageCertificateStrategy;

// The consumer of junobuild_auth and junobuild_storage is responsible for implementing
// the functions that update the certified data. This way, both libraries remain unaware
// of each other.

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

    fn get_pruned_labeled_sigs_root_hash_tree(&self) -> HashTree {
        pruned_labeled_sigs_root_hash_tree()
    }
}
