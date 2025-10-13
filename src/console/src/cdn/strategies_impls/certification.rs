use crate::certification::cert::update_certified_data;
use ic_certification::HashTree;
use junobuild_auth::runtime::pruned_labeled_sigs_root_hash_tree;
use junobuild_storage::strategies::StorageCertificateStrategy;

pub struct StorageCertificate;

impl StorageCertificateStrategy for StorageCertificate {
    fn update_certified_data(&self) {
        update_certified_data();
    }

    // We use this function to access the auth signatures root hash
    // in the storage crate when we build an HTTP response because the
    // tree is a fork of both assets and signatures.
    fn get_pruned_labeled_sigs_root_hash_tree(&self) -> HashTree {
        pruned_labeled_sigs_root_hash_tree()
    }
}
