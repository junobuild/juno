pub static ASSET_ENCODING_NO_COMPRESSION: &str = "identity";
pub static ENCODING_CERTIFICATION_ORDER: &[&str] = &[
    ASSET_ENCODING_NO_COMPRESSION,
    "gzip",
    "compress",
    "deflate",
    "br",
];
pub static BN_WELL_KNOWN_CUSTOM_DOMAINS: &str = "/.well-known/ic-domains";
pub static REWRITE_TO_ROOT_INDEX_HTML: (&str, &str) = ("**", "/index.html");

pub static RESPONSE_STATUS_CODE_200: u16 = 200;
pub static RESPONSE_STATUS_CODE_404: u16 = 404;
pub static RESPONSE_STATUS_CODE_405: u16 = 405;
pub static RESPONSE_STATUS_CODE_406: u16 = 406;
pub static RESPONSE_STATUS_CODE_500: u16 = 500;
