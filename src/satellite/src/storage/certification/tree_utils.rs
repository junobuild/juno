use crate::storage::certification::constants::{
    EXACT_MATCH_TERMINATOR, IC_CERTIFICATE_EXPRESSION, IC_CERTIFICATE_EXPRESSION_HEADER,
    IC_STATUS_CODE_PSEUDO_HEADER, LABEL_HTTP_EXPR, WILDCARD_MATCH_TERMINATOR,
};
use crate::storage::http::types::{HeaderField, StatusCode};
use crate::storage::types::state::FullPath;
use crate::types::core::Blob;
use ic_certification::Hash;
use ic_representation_independent_hash::{representation_independent_hash, Value};
use sha2::{Digest, Sha256};

pub fn nested_tree_key(
    full_path: &FullPath,
    headers: &[HeaderField],
    body_hash: Hash,
    terminator: &str,
    status_code: StatusCode,
) -> Vec<Blob> {
    let mut segments = nested_tree_path(full_path, terminator);

    let expr_hash: Hash = Sha256::digest(response_headers_expression(headers)).into();
    segments.push(Vec::from(expr_hash.as_slice()));

    segments.push(vec![]);
    segments.push(Vec::from(response_hash(headers, status_code, &body_hash)));

    segments
}

pub fn nested_tree_path(full_path: &str, terminator: &str) -> Vec<Blob> {
    assert!(full_path.starts_with('/'));

    let mut segments: Vec<Blob> = full_path
        .split('/')
        .map(str::as_bytes)
        .map(Vec::from)
        .collect();
    segments.remove(0); // remove leading empty string due to absolute path
    segments.push(terminator.as_bytes().to_vec());

    segments
}

pub fn fallback_paths(paths: Vec<Blob>) -> Vec<Blob> {
    let mut fallback_paths = Vec::new();

    // starting at 1 because "http_expr" is always the starting element
    for i in 1..paths.len() {
        let mut without_trailing_slash: Vec<Blob> = paths.as_slice()[0..i].to_vec();
        let mut with_trailing_slash = without_trailing_slash.clone();
        without_trailing_slash.push(EXACT_MATCH_TERMINATOR.as_bytes().to_vec());
        with_trailing_slash.push("".as_bytes().to_vec());
        with_trailing_slash.push(WILDCARD_MATCH_TERMINATOR.as_bytes().to_vec());

        fallback_paths.extend(without_trailing_slash);
        fallback_paths.extend(with_trailing_slash);
    }

    fallback_paths
}

pub fn nested_tree_expr_path(absolute_path: &str, terminator: &str) -> Vec<String> {
    assert!(absolute_path.starts_with('/'));

    // "/" => ["", ""]
    // "/index.html" => ["", "index.html"]
    // "/hello/index.html" => ["", "hello", "index.html"]
    let mut path: Vec<String> = absolute_path.split('/').map(str::to_string).collect();
    // replace the first empty split segment (due to absolute path) with "http_expr"
    *path.get_mut(0).unwrap() = LABEL_HTTP_EXPR.to_string();
    path.push(terminator.to_string());
    path
}

fn response_hash(headers: &[HeaderField], status_code: StatusCode, body_hash: &Hash) -> Hash {
    // certification v2 spec:
    // Response hash is the hash of the concatenation of
    //   - representation-independent hash of headers
    //   - hash of the response body
    //
    // The representation-independent hash of headers consist of
    //    - all certified headers (here all headers), plus
    //    - synthetic header `:ic-cert-status` with value <HTTP status code of response>

    let mut certified_headers = headers
        .iter()
        .map(|HeaderField(header, value)| {
            (header.to_ascii_lowercase(), Value::String(value.clone()))
        })
        .collect::<Vec<(String, Value)>>();

    certified_headers.push((
        IC_CERTIFICATE_EXPRESSION_HEADER.to_ascii_lowercase(),
        Value::String(response_headers_expression(headers)),
    ));

    certified_headers.push((
        IC_STATUS_CODE_PSEUDO_HEADER.to_string(),
        Value::Number(status_code.into()),
    ));

    let header_hash = representation_independent_hash(&certified_headers);
    Sha256::digest([header_hash.as_ref(), body_hash].concat()).into()
}

pub fn response_headers_expression(headers: &[HeaderField]) -> String {
    let headers = headers
        .iter()
        .map(|field: &HeaderField| format!("\"{}\"", field.0))
        .collect::<Vec<_>>()
        .join(",");

    IC_CERTIFICATE_EXPRESSION.replace("{headers}", &headers)
}
