use ic_certification::Hash;

pub trait CertificateStrategy {
    fn update_root_hash(
        &self,
    );
    
    fn get_asset_hashes_root_hash(
        &self,
    ) -> Hash;
}