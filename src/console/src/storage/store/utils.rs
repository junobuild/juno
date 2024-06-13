use junobuild_shared::types::core::Blob;
use junobuild_storage::types::store::AssetEncoding;

pub fn get_content_chunks(encoding: &AssetEncoding, chunk_index: usize) -> Option<Blob> {
    Some(encoding.content_chunks[chunk_index].clone())
}
