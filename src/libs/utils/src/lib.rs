#![doc = include_str!("../README.md")]

mod doc;
mod json;
mod serializers;
mod types;
pub mod with;

pub use doc::*;
pub use json::*;

pub use crate::serializers::types::{
    DocDataBigInt, DocDataPrincipal, DocDataUint8Array, JsonDataBigInt, JsonDataPrincipal,
    JsonDataUint8Array,
};
pub use crate::types::{FromJsonData, IntoJsonData};
