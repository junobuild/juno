use crate::storage::certification::constants::{
    IC_CERTIFICATE_EXPRESSION_HEADER, IC_CERTIFICATE_HEADER,
};
use crate::storage::certification::tree_utils::response_headers_expression;
use crate::storage::certification::types::certified::CertifiedAssetHashes;
use crate::storage::http::types::HeaderField;
use crate::types::core::Blob;
use base64::encode;
use ic_cdk::api::{data_certificate, set_certified_data};
use serde::Serialize;
use serde_cbor::ser::Serializer;

pub fn update_certified_data(asset_hashes: &CertifiedAssetHashes) {
    let prefixed_root_hash = &asset_hashes.root_hash();
    set_certified_data(&prefixed_root_hash[..]);
}

pub fn build_asset_certificate_header(
    asset_hashes: &CertifiedAssetHashes,
    url: String,
    certificate_version: &Option<u16>,
    rewrite_source: &Option<String>,
) -> Result<HeaderField, &'static str> {
    let certificate = data_certificate();

    match certificate {
        None => Err("No certificate found."),
        Some(certificate) => match certificate_version {
            None | Some(1) => {
                build_asset_certificate_header_v1_impl(&certificate, asset_hashes, &url)
            }
            Some(2) => build_asset_certificate_header_v2_impl(
                &certificate,
                asset_hashes,
                &url,
                rewrite_source,
            ),
            _ => Err("Unsupported certificate version to certify headers."),
        },
    }
}

pub fn build_certified_expression(
    asset_headers: &[HeaderField],
    certificate_version: &Option<u16>,
) -> Result<Option<HeaderField>, &'static str> {
    match certificate_version {
        None | Some(1) => Ok(None),
        Some(2) => Ok(Some(HeaderField(
            IC_CERTIFICATE_EXPRESSION_HEADER.to_string(),
            response_headers_expression(asset_headers),
        ))),
        _ => Err("Unsupported certificate version to certify expression."),
    }
}

fn build_asset_certificate_header_v1_impl(
    certificate: &Blob,
    asset_hashes: &CertifiedAssetHashes,
    url: &str,
) -> Result<HeaderField, &'static str> {
    let tree = asset_hashes.witness_v1(url);

    let mut serializer = Serializer::new(vec![]);
    serializer.self_describe().unwrap();
    let result = tree.serialize(&mut serializer);

    match result {
        Err(_err) => Err("Failed to serialize a hash tree."),
        Ok(_serialize) => Ok(HeaderField(
            IC_CERTIFICATE_HEADER.to_string(),
            format!(
                "certificate=:{}:, tree=:{}:",
                encode(certificate),
                encode(serializer.into_inner())
            ),
        )),
    }
}

fn build_asset_certificate_header_v2_impl(
    certificate: &Blob,
    asset_hashes: &CertifiedAssetHashes,
    url: &str,
    rewrite_source: &Option<String>,
) -> Result<HeaderField, &'static str> {
    assert!(url.starts_with('/'));

    let tree = match rewrite_source {
        None => asset_hashes.witness_v2(url),
        Some(_) => asset_hashes.witness_rewrite_v2(url),
    };

    let mut serializer = Serializer::new(vec![]);
    serializer.self_describe().unwrap();
    let result = tree.serialize(&mut serializer);

    match result {
        Err(_err) => Err("Failed to serialize a hash tree."),
        Ok(_serialize) => {
            let mut expr_path_serializer = Serializer::new(vec![]);
            expr_path_serializer.self_describe().unwrap();

            let path = asset_hashes.expr_path_v2(url, rewrite_source);
            let result_path = path.serialize(&mut expr_path_serializer);

            match result_path {
                Err(_err) => Err("Failed to serialize path."),
                Ok(_serialize) => Ok(HeaderField(
                    IC_CERTIFICATE_HEADER.to_string(),
                    format!(
                        "certificate=:{}:, tree=:{}:, expr_path=:{}:, version=2",
                        encode(certificate),
                        encode(serializer.into_inner()),
                        encode(expr_path_serializer.into_inner())
                    ),
                )),
            }
        }
    }
}
