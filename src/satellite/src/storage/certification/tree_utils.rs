use crate::storage::certification::constants::{
    IC_CERTIFICATE_EXPRESSION, IC_CERTIFICATE_EXPRESSION_HEADER, IC_STATUS_CODE_PSEUDO_HEADER,
    LABEL_HTTP_EXPR, WILDCARD_MATCH_TERMINATOR,
};
use crate::storage::types::http::HeaderField;
use crate::storage::types::state::FullPath;
use crate::types::core::Blob;
use ic_certified_map::Hash;
use ic_representation_independent_hash::{representation_independent_hash, Value};
use sha2::{Digest, Sha256};

pub fn nested_tree_key(
    full_path: &FullPath,
    headers: &[HeaderField],
    body_hash: Hash,
    terminator: &str,
) -> Vec<Blob> {
    let mut segments = nested_tree_path(full_path, terminator);

    let expr_hash: Hash = Sha256::digest(response_headers_expression(headers)).into();
    segments.push(Vec::from(expr_hash.as_slice()));

    segments.push(vec![]);
    segments.push(Vec::from(response_hash(headers, 200, &body_hash)));

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

fn response_hash(headers: &[HeaderField], status_code: u16, body_hash: &Hash) -> Hash {
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
