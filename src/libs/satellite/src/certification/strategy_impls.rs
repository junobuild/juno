use crate::certification::cert::update_certified_data;
use junobuild_storage::strategies::StorageCertificateStrategy;

pub struct StorageCertificate;

impl StorageCertificateStrategy for StorageCertificate {
    fn update_certified_data(&self) {
        update_certified_data()
    }
}
