pub static ASSET_ENCODING_NO_COMPRESSION: &str = "identity";
pub static ENCODING_CERTIFICATION_ORDER: &[&str] = &[
    ASSET_ENCODING_NO_COMPRESSION,
    "gzip",
    "compress",
    "deflate",
    "br",
];
pub static BN_WELL_KNOWN_CUSTOM_DOMAINS: &str = "/.well-known/custom-domains";
