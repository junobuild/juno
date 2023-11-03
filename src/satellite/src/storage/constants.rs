use crate::storage::http::types::StatusCode;

pub static ASSET_ENCODING_NO_COMPRESSION: &str = "identity";
pub static ENCODING_CERTIFICATION_ORDER: &[&str] = &[
    ASSET_ENCODING_NO_COMPRESSION,
    "gzip",
    "compress",
    "deflate",
    "br",
];
pub static BN_WELL_KNOWN_CUSTOM_DOMAINS: &str = "/.well-known/ic-domains";

pub static ROOT_PATH: &str = "/";
pub static ROOT_INDEX_HTML: &str = "/index.html";
pub static ROOT_404_HTML: &str = "/404.html";
pub static ROOT_PATHS: [&str; 5] = ["/index.html", "/index", "/", "/404", "/404.html"];

pub static RESPONSE_STATUS_CODE_200: StatusCode = 200;
pub static RESPONSE_STATUS_CODE_404: StatusCode = 404;
pub static RESPONSE_STATUS_CODE_405: StatusCode = 405;
pub static RESPONSE_STATUS_CODE_406: StatusCode = 406;
pub static RESPONSE_STATUS_CODE_500: StatusCode = 500;
