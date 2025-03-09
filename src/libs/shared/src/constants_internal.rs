use crate::types::state::Version;

// Controllers / principals, hopefully only one, that were revoked following inherited security incident in February 2024.
pub const REVOKED_CONTROLLERS: [&str; 1] =
    ["535yc-uxytb-gfk7h-tny7p-vjkoe-i4krp-3qmcl-uqfgr-cpgej-yqtjq-rqe"];

// The default version number when a new entity is persisted for the first time.
pub const INITIAL_VERSION: Version = 1;

// The upper limit on the WASM heap memory consumption of the canister per default on the IC is now 3_221_225_472 (3 GiB).
// According to our experience, we start noticing issue when we upgrade canister at 1 GB. That's why the Juno CLI and Console already warn when this limited is reached - i.e. warns when 900 Mb is reached.
// So, to enforce this limit, we set the canister maximum heap memory per default to 1_073_741_824 (1 GiB).
pub const WASM_MEMORY_LIMIT: u32 = 1_073_741_824;
