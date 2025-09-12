use crate::types::state::FullPath;
use crate::types::store::{Asset, AssetEncoding};
use ic_stable_structures::{StableBTreeMap, Storable};
use junobuild_shared::serializers::serialize_to_bytes;
use junobuild_shared::types::core::Blob;
use junobuild_shared::types::memory::Memory;
use serde::Serialize;

pub fn insert_asset_encoding_stable<K>(
    full_path: &FullPath,
    encoding_type: &str,
    encoding: &AssetEncoding,
    asset: &mut Asset,
    stable_encoding_chunk_key: impl Fn(&FullPath, &str, usize) -> K,
    chunks: &mut StableBTreeMap<K, Blob, Memory>,
) where
    K: Clone + Serialize + Storable + Ord,
{
    let mut content_chunks = Vec::new();

    // Insert each chunk into the StableBTreeMap
    for (i, chunk) in encoding.content_chunks.iter().enumerate() {
        let key = stable_encoding_chunk_key(full_path, encoding_type, i);

        chunks.insert(key.clone(), chunk.clone());

        content_chunks.push(serialize_to_bytes(&key).into_owned());
    }

    // Insert the encoding by replacing the chunks with their referenced keys serialized
    asset.encodings.insert(
        encoding_type.to_owned(),
        AssetEncoding {
            content_chunks,
            ..encoding.clone()
        },
    );

    ic_cdk::print(format!("------------encoding INSERT------------------> {} {} {}", full_path, encoding_type, asset.encodings.get(encoding_type).is_some()));
}
