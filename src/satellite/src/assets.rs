use junobuild_satellite::id;
use junobuild_satellite::set_asset_handler;
use junobuild_storage::http::types::HeaderField;
use junobuild_storage::types::store::AssetKey;

const INDEX_HTML: &[u8] = include_bytes!("../resources/index.html");

pub fn init_asset() -> Result<(), String> {
    let collection = "#dapp".to_string();

    let name = "index.html".to_string();

    let full_path = format!("/{name}").to_string();

    let key: AssetKey = AssetKey {
        name: name.clone(),
        full_path: full_path.clone(),
        token: None,
        collection,
        owner: id(),
        description: None,
    };

    let headers = vec![HeaderField(
        "content-type".to_string(),
        "text/html".to_string(),
    )];

    set_asset_handler(&key, &INDEX_HTML.to_vec(), &headers)
}
