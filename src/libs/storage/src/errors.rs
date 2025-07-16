pub const JUNO_STORAGE_ERROR_UPLOAD_NOT_ALLOWED: &str = "juno.storage.error.upload_not_allowed";
pub const JUNO_STORAGE_ERROR_SET_NOT_ALLOWED: &str = "juno.storage.error.set_not_allowed";
// Provided collection does not match existing collection
pub const JUNO_STORAGE_ERROR_CANNOT_COMMIT_INVALID_COLLECTION: &str =
    "juno.storage.error.cannot_commit_invalid_collection";
pub const JUNO_STORAGE_ERROR_CANNOT_COMMIT_BATCH: &str = "juno.storage.error.cannot_commit_batch";
pub const JUNO_STORAGE_ERROR_ASSET_NOT_FOUND: &str = "juno.storage.error.asset_not_found";
pub const JUNO_STORAGE_ERROR_CANNOT_READ_ASSET: &str = "juno.storage.error.cannot_read_asset";
// Asset path must be prefixed with collection key. e.g. collection #releases or releases must match a path /releases/something
pub const JUNO_STORAGE_ERROR_UPLOAD_PATH_COLLECTION_PREFIX: &str =
    "juno.storage.error.upload_path_collection_prefix";
pub const JUNO_STORAGE_ERROR_RESERVED_ASSET: &str = "juno.storage.error.reserved_asset";
pub const JUNO_STORAGE_ERROR_BATCH_NOT_FOUND: &str = "juno.storage.error.batch_not_found";
pub const JUNO_STORAGE_ERROR_CHUNK_NOT_FOUND: &str = "juno.storage.error.chunk_not_found";
pub const JUNO_STORAGE_ERROR_CHUNK_NOT_INCLUDED_IN_BATCH: &str =
    "juno.storage.error.chunk_not_included_in_batch";
pub const JUNO_STORAGE_ERROR_CHUNK_TO_COMMIT_NOT_FOUND: &str =
    "juno.storage.error.chunk_to_commit_not_found";
// Asset exceed max allowed size
pub const JUNO_STORAGE_ERROR_ASSET_MAX_ALLOWED_SIZE: &str =
    "juno.storage.error.asset_max_allowed_size";
