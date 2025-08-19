use crate::services::read_state;
use ic_canister_sig_creation::signature_map::LABEL_SIG;
use ic_certification::hash_tree::HashTree;
use ic_certification::{labeled_hash, pruned, Hash};

fn sigs_root_hash() -> Hash {
    read_state(|state| state.runtime.sigs.root_hash())
}

pub fn labeled_sigs_root_hash() -> Hash {
    labeled_hash(LABEL_SIG, &sigs_root_hash())
}

pub fn pruned_labeled_sigs_root_hash_tree() -> HashTree<Vec<u8>> {
    pruned(labeled_hash(LABEL_SIG, &sigs_root_hash()))
}
