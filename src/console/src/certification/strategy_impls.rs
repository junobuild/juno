use crate::certification::cert::update_certified_data;
use ic_certification::HashTree;
use junobuild_auth::runtime::pruned_labeled_sigs_root_hash_tree;
use junobuild_auth::strategies::AuthCertificateStrategy;
use junobuild_auth::types::state::Salt;
use junobuild_storage::strategies::StorageCertificateStrategy;

/// The consumer of junobuild_auth and junobuild_storage is responsible for implementing
/// the functions that update the certified data. This way, both libraries remain unaware
/// of each other.

pub struct AuthCertificate;

impl AuthCertificateStrategy for AuthCertificate {
    fn update_certified_data(&self) {
        update_certified_data()
    }

    fn salt(&self) -> Option<Salt> {
        get_salt()
    }
}

pub struct StorageCertificate;

impl StorageCertificateStrategy for StorageCertificate {
    fn update_certified_data(&self) {
        update_certified_data();
    }

    fn get_pruned_labeled_sigs_root_hash_tree(&self) -> HashTree {
        pruned_labeled_sigs_root_hash_tree()
    }
}
