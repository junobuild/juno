use crate::storage::types::assets::AssetHashes;
use crate::storage::types::http::HeaderField;
use base64::encode;
use ic_cdk::api::{data_certificate, set_certified_data};
use ic_certified_map::{labeled, labeled_hash, AsHashTree};
use serde::Serialize;
use serde_cbor::ser::Serializer;

const LABEL_ASSETS: &[u8] = b"http_assets";

pub fn update_certified_data(asset_hashes: &AssetHashes) {
    let prefixed_root_hash = &labeled_hash(LABEL_ASSETS, &asset_hashes.tree.root_hash());
    set_certified_data(&prefixed_root_hash[..]);
}

pub fn build_asset_certificate_header(
    asset_hashes: &AssetHashes,
    url: String,
) -> Result<HeaderField, &'static str> {
    let certificate = data_certificate();

    match certificate {
        None => Err("No certificate found."),
        Some(certificate) => build_asset_certificate_header_impl(&certificate, asset_hashes, &url),
    }
}

fn build_asset_certificate_header_impl(
    certificate: &Vec<u8>,
    asset_hashes: &AssetHashes,
    url: &String,
) -> Result<HeaderField, &'static str> {
    let witness = asset_hashes.tree.witness(url.as_bytes());
    let tree = labeled(LABEL_ASSETS, witness);

    let mut serializer = Serializer::new(vec![]);
    serializer.self_describe().unwrap();
    let result = tree.serialize(&mut serializer);

    match result {
        Err(_err) => Err("Failed to serialize a hash tree."),
        Ok(_serialize) => Ok(HeaderField(
            "IC-Certificate".to_string(),
            format!(
                "certificate=:{}:, tree=:{}:",
                encode(certificate),
                encode(serializer.into_inner())
            ),
        )),
    }
}
