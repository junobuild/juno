use crate::services::read_state;
use ic_certification::Hash;

pub fn sigs_root_hash() -> Hash {
    read_state(|state| state.runtime.sigs.root_hash())
}
