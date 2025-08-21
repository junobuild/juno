use ic_cdk::api::certified_data_set as set_certified_data;
use ic_certification::fork_hash;
use junobuild_auth::labeled_sigs_root_hash;
use junobuild_storage::runtime::certified_assets_root_hash;

pub fn update_certified_data() {
    let prefixed_root_hash = fork_hash(
        &certified_assets_root_hash(),
        // NB: sigs have to be added last due to lexicographic order of labels
        &labeled_sigs_root_hash(),
    );

    set_certified_data(&prefixed_root_hash[..]);
}
