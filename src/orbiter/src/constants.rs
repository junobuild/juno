use candid::Principal;

pub const LONG_STRING_MAX_LENGTH: usize = 4096; // 1024 * 4
pub const STRING_MAX_LENGTH: usize = 1024;
pub const SHORT_STRING_MAX_LENGTH: usize = 256;
pub const KEY_MAX_LENGTH: usize = 36; // UUID length
pub const METADATA_MAX_ELEMENTS: usize = 10;

pub const SERIALIZED_PRINCIPAL_LENGTH: usize = 30;
pub const SERIALIZED_LONG_STRING_LENGTH: usize = LONG_STRING_MAX_LENGTH + 1;
pub const SERIALIZED_STRING_LENGTH: usize = STRING_MAX_LENGTH + 1;
pub const SERIALIZED_SHORT_STRING_LENGTH: usize = SHORT_STRING_MAX_LENGTH + 1;
pub const SERIALIZED_KEY_LENGTH: usize = KEY_MAX_LENGTH + 1;
pub const SERIALIZED_METADATA_LENGTH: usize =
    METADATA_MAX_ELEMENTS * (SERIALIZED_SHORT_STRING_LENGTH * 2);

pub const PRINCIPAL_MIN: Principal = Principal::from_slice(&[]);
pub const PRINCIPAL_MAX: Principal = Principal::from_slice(&[255; 29]);
