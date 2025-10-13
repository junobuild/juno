use ic_cdk::api::certified_data_set as set_certified_data;
use junobuild_storage::runtime::certified_assets_root_hash;

pub fn update_certified_data() {
    let prefixed_root_hash = &certified_assets_root_hash();
    set_certified_data(&prefixed_root_hash[..]);
}
