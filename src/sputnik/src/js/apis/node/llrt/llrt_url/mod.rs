pub mod url_class;
pub mod url_search_params;

use url::Url;

// https://url.spec.whatwg.org/#cannot-be-a-base-url-path-state
pub fn convert_trailing_space(url: &mut Url) {
    if matches!(
        url.scheme(),
        "file" | "ftp" | "http" | "https" | "ws" | "wss"
    ) {
        return;
    }

    let path = url.path();
    let has_remaining = url.fragment().is_some() || url.query().is_some();

    #[allow(clippy::manual_strip)]
    if path.ends_with(' ') && has_remaining {
        let new_path = [&path[..path.len() - 1], "%20"].concat();
        url.set_path(&new_path);
    }
}
