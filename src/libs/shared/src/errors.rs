// Error message indicating no timestamp was provided.
pub const JUNO_ERROR_NO_TIMESTAMP: &str = "juno.error.no_timestamp_provided";
// Error message indicating the provided timestamp is either outdated or in the future.
pub const JUNO_ERROR_TIMESTAMP_OUTDATED_OR_FUTURE: &str = "juno.error.timestamp_outdated_or_future";
// Error message indicating no version was provided.
pub const JUNO_ERROR_NO_VERSION: &str = "juno.error.no_version_provided";
// Error message indicating the provided version is either outdated or in the future.
pub const JUNO_ERROR_VERSION_OUTDATED_OR_FUTURE: &str = "juno.error.version_outdated_or_future";
// Maximum number of controllers ({}) is already reached.
pub const JUNO_ERROR_CONTROLLERS_MAX_NUMBER: &str = "juno.error.controllers.max_number";
// Anonymous controller not allowed.
pub const JUNO_ERROR_CONTROLLERS_ANONYMOUS_NOT_ALLOWED: &str =
    "juno.error.controllers.anonymous_not_allowed";
// Revoked controller not allowed.
pub const JUNO_ERROR_CONTROLLERS_REVOKED_NOT_ALLOWED: &str =
    "juno.error.controllers.revoked_not_allowed";
// Stable memory usage exceeded: {} bytes used, {} bytes allowed.
pub const JUNO_ERROR_MEMORY_STABLE_EXCEEDED: &str = "juno.error.memory.stable_exceeded";
// Heap memory usage exceeded: {} bytes used, {} bytes allowed.
pub const JUNO_ERROR_MEMORY_HEAP_EXCEEDED: &str = "juno.error.memory.heap_exceeded";
// Max documents per user exceeded: {} documents owned, {} documents allowed.
pub const JUNO_ERROR_MAX_DOCS_PER_USER_EXCEEDED: &str = "juno.error.max_docs_per_user_exceeded";
// Balance ({}) is lower than the amount of cycles {} to deposit.
pub const JUNO_ERROR_CYCLES_DEPOSIT_BALANCE_LOW: &str = "juno.error.cycles.deposit_balance_low";
// Deposit cycles failed.
pub const JUNO_ERROR_CYCLES_DEPOSIT_FAILED: &str = "juno.error.cycles.deposit_failed";
// Failed to create canister
pub const JUNO_ERROR_CANISTER_CREATE_FAILED: &str = "juno.error.canister.create_failed";
// Failed to install code in canister
pub const JUNO_ERROR_CANISTER_INSTALL_CODE_FAILED: &str = "juno.error.canister.install_code_failed";
// Cannot stop segment
pub const JUNO_ERROR_SEGMENT_STOP_FAILED: &str = "juno.error.segment.stop_failed";
// Cannot delete segment
pub const JUNO_ERROR_SEGMENT_DELETE_FAILED: &str = "juno.error.segment.delete_failed";
// Failed to call ledger
pub const JUNO_ERROR_CMC_CALL_LEDGER_FAILED: &str = "juno.error.cmc.call_ledger_failed";
// Ledger transfer failed
pub const JUNO_ERROR_CMC_LEDGER_TRANSFER_FAILED: &str = "juno.error.cmc.ledger_transfer_failed";
// Top-up failed
pub const JUNO_ERROR_CMC_TOP_UP_FAILED: &str = "juno.error.cmc.top_up_failed";
// Failed to call CMC to create canister
pub const JUNO_ERROR_CMC_CALL_CREATE_CANISTER_FAILED: &str =
    "juno.error.cmc.call_create_canister_failed";
// Failed to create canister with CMC
pub const JUNO_ERROR_CMC_CREATE_CANISTER_FAILED: &str = "juno.error.cmc.create_canister_failed";
// Failed to install code with CMC
pub const JUNO_ERROR_CMC_INSTALL_CODE_FAILED: &str = "juno.error.cmc.install_code_failed";
// Invalid regex
pub const JUNO_ERROR_INVALID_REGEX: &str = "juno.error.invalid_regex";
