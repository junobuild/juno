pub mod serializers;

use serde::{Deserialize, Serialize};
use serde_json::{from_slice, to_vec};

pub fn decode_doc_data<T: for<'a> Deserialize<'a>>(data: &[u8]) -> Result<T, String> {
    from_slice::<T>(data).map_err(|e| e.to_string())
}

pub fn encode_doc_data<T: Serialize>(data: &T) -> Result<Vec<u8>, String> {
    to_vec(data).map_err(|e| e.to_string())
}
