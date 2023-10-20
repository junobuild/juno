/// Certification
pub const LABEL_ASSETS_V1: &[u8] = b"http_assets";
pub const LABEL_ASSETS_V2: &[u8] = b"http_expr";
pub const LABEL_HTTP_EXPR: &str = "http_expr";
pub const EXACT_MATCH_TERMINATOR: &str = "<$>";
pub const WILDCARD_MATCH_TERMINATOR: &str = "<*>";
pub const IC_CERTIFICATE_HEADER: &str = "IC-Certificate";
pub const IC_CERTIFICATE_EXPRESSION_HEADER: &str = "IC-CertificateExpression";
pub const IC_STATUS_CODE_PSEUDO_HEADER: &str = ":ic-cert-status";
pub const IC_CERTIFICATE_EXPRESSION: &str = r#"default_certification(ValidationArgs{certification:Certification{no_request_certification:Empty{},response_certification:ResponseCertification{certified_response_headers:ResponseHeaderList{headers:[{headers}]}}}})"#;
