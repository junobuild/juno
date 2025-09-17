use crate::types::store::{Asset, AssetEncoding};

pub type WellKnownAsset = (Asset, AssetEncoding);
pub type PrepareWellKnownAssetFn = dyn Fn(&str, Option<Asset>) -> WellKnownAsset;
