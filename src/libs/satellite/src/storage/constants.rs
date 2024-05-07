use crate::storage::http::types::StatusCode;

pub const ASSET_ENCODING_NO_COMPRESSION: &str = "identity";
pub const ENCODING_CERTIFICATION_ORDER: &[&str] = &[
    ASSET_ENCODING_NO_COMPRESSION,
    "gzip",
    "compress",
    "deflate",
    "br",
];
pub const BN_WELL_KNOWN_CUSTOM_DOMAINS: &str = "/.well-known/ic-domains";
pub const WELL_KNOWN_II_ALTERNATIVE_ORIGINS: &str = "/.well-known/ii-alternative-origins";

pub const ROOT_PATH: &str = "/";
pub const ROOT_INDEX_HTML: &str = "/index.html";
pub const ROOT_404_HTML: &str = "/404.html";
pub const ROOT_PATHS: [&str; 5] = ["/index.html", "/index", "/", "/404", "/404.html"];

pub const RESPONSE_STATUS_CODE_200: StatusCode = 200;
pub const RESPONSE_STATUS_CODE_308: StatusCode = 308;
pub const RESPONSE_STATUS_CODE_404: StatusCode = 404;
pub const RESPONSE_STATUS_CODE_405: StatusCode = 405;
pub const RESPONSE_STATUS_CODE_406: StatusCode = 406;
pub const RESPONSE_STATUS_CODE_500: StatusCode = 500;

pub const RAW_DOMAINS: [&str; 4] = [
    ".raw.icp0.io",
    ".raw.ic0.app",
    ".raw.icp-api.io",
    ".raw.internetcomputer.org",
];
