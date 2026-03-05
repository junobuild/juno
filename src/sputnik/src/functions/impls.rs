use crate::functions::types::{NoArgs, NoResult};
use junobuild_utils::{FromJsonData, IntoJsonData};

impl IntoJsonData for NoArgs {
    fn into_json_data(self) -> Result<Vec<u8>, String> {
        // Used only for compilation purposes. Is never used.
        Ok(vec![])
    }
}

impl FromJsonData for NoResult {
    fn from_json_data(_bytes: &[u8]) -> Result<Self, String> {
        // Used only for compilation purposes. Is never used.
        Ok(NoResult)
    }
}
