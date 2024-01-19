pub mod serializers;

use serde::{Deserialize, Serialize};
use serde_json::{from_slice, to_vec, Result};

pub fn decode_doc_data<T: for<'a> Deserialize<'a>>(data: &[u8]) -> Result<T> {
    from_slice::<T>(data)
}

pub fn encode_doc_data<T: Serialize>(data: &T) -> Result<Vec<u8>> {
    to_vec(data)
}
