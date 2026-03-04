use crate::functions::types::NoArgs;
use junobuild_utils::IntoJsonData;

impl IntoJsonData for NoArgs {
    fn into_json_data(self) -> Result<Vec<u8>, String> {
        // Used only for compilation purposes. Is never used.
        Ok(vec![])
    }
}
