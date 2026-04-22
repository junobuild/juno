pub trait IntoJsonData {
    fn into_json_data(self) -> Result<Vec<u8>, String>;
}

pub trait FromJsonData: Sized {
    fn from_json_data(bytes: &[u8]) -> Result<Self, String>;
}
