use crate::constants::{
    RAW_DOMAINS, RESPONSE_STATUS_CODE_200, RESPONSE_STATUS_CODE_404, ROOT_404_HTML,
    ROOT_INDEX_HTML, ROOT_PATH,
};
use crate::http::types::HeaderField;
use crate::rewrites::{is_root_path, redirect_url, rewrite_url};
use crate::strategies::StorageStateStrategy;
use crate::types::config::StorageConfigRawAccess;
use crate::types::http_request::{
    MapUrl, Routing, RoutingDefault, RoutingRedirect, RoutingRedirectRaw, RoutingRewrite,
};
use crate::types::state::FullPath;
use crate::types::store::Asset;
use crate::url::{map_alternative_paths, map_url};
use junobuild_collections::types::rules::Memory;
use junobuild_shared::ic::id;

pub fn get_routing(
    url: String,
    req_headers: &[HeaderField],
    include_alternative_routing: bool,
    storage_state: &impl StorageStateStrategy,
) -> Result<Routing, &'static str> {
    if url.is_empty() {
        return Err("No url provided.");
    }

    // .raw. is not allowed per default for security reason.
    let redirect_raw = get_routing_redirect_raw(&url, req_headers, storage_state);

    match redirect_raw {
        None => (),
        Some(redirect_raw) => {
            return Ok(redirect_raw);
        }
    }

    // The certification considers, and should only, the path of the URL. If query parameters, these should be omitted in the certificate.
    // Likewise the memory contains only assets indexed with their respective path.
    // e.g.
    // url: /hello/something?param=123
    // path: /hello/something

    let MapUrl { path, token } = map_url(&url)?;

    // We return the asset that matches the effective path
    let asset: Option<(Asset, Memory)> =
        storage_state.get_public_asset(path.clone(), token.clone());

    match asset {
        None => (),
        Some(_) => {
            return Ok(Routing::Default(RoutingDefault { url: path, asset }));
        }
    }

    // ⚠️ Limitation: requesting an url without extension try to resolve first a corresponding asset
    // e.g. /.well-known/hello -> try to find /.well-known/hello.html
    // Therefore if a file without extension is uploaded to the storage, it is important to not upload an .html file with the same name next to it or a folder/index.html
    let alternative_asset = get_alternative_asset(&path, &token, storage_state);
    match alternative_asset {
        None => (),
        Some(alternative_asset) => {
            return Ok(Routing::Default(RoutingDefault {
                url: path.clone(),
                asset: Some(alternative_asset),
            }));
        }
    }

    if include_alternative_routing {
        // Search for potential redirect
        let redirect = get_routing_redirect(&path, storage_state);

        match redirect {
            None => (),
            Some(redirect) => {
                return Ok(redirect);
            }
        }

        // Search for potential rewrite
        let rewrite = get_routing_rewrite(&path, &token, storage_state);

        match rewrite {
            None => (),
            Some(rewrite) => {
                return Ok(rewrite);
            }
        }

        // Search for potential default rewrite for HTML pages
        let root_rewrite = get_routing_root_rewrite(&path, storage_state);

        match root_rewrite {
            None => (),
            Some(root_rewrite) => {
                return Ok(root_rewrite);
            }
        }
    }

    Ok(Routing::Default(RoutingDefault {
        url: path,
        asset: None,
    }))
}

fn get_alternative_asset(
    path: &String,
    token: &Option<String>,
    storage_state: &impl StorageStateStrategy,
) -> Option<(Asset, Memory)> {
    let alternative_paths = map_alternative_paths(path);

    for alternative_path in alternative_paths {
        let asset: Option<(Asset, Memory)> =
            storage_state.get_public_asset(alternative_path, token.clone());

        // We return the first match
        match asset {
            None => (),
            Some(_) => {
                return asset;
            }
        }
    }

    None
}

fn get_routing_rewrite(
    path: &FullPath,
    token: &Option<String>,
    storage_state: &impl StorageStateStrategy,
) -> Option<Routing> {
    // If we have found no asset, we try a rewrite rule
    // This is for example useful for single-page app to redirect all urls to /index.html
    let rewrite = rewrite_url(path, &storage_state.get_config());

    match rewrite {
        None => (),
        Some(rewrite) => {
            let (source, destination) = rewrite;

            // Search for rewrite configured as an alternative path
            // e.g. rewrite /demo/* to /sample
            let rewrite_asset = get_alternative_asset(&destination, token, storage_state);

            match rewrite_asset {
                None => (),
                Some(_) => {
                    return Some(Routing::Rewrite(RoutingRewrite {
                        url: path.clone(),
                        asset: rewrite_asset,
                        source,
                        status_code: RESPONSE_STATUS_CODE_200,
                    }));
                }
            }

            // Rewrite is maybe configured as an absolute path
            // e.g. write /demo/* to /sample.html
            let rewrite_absolute_asset: Option<(Asset, Memory)> =
                storage_state.get_public_asset(destination.clone(), token.clone());

            match rewrite_absolute_asset {
                None => (),
                Some(_) => {
                    return Some(Routing::Rewrite(RoutingRewrite {
                        url: path.clone(),
                        asset: rewrite_absolute_asset,
                        source,
                        status_code: RESPONSE_STATUS_CODE_200,
                    }));
                }
            }
        }
    }

    None
}

fn get_routing_root_rewrite(
    path: &FullPath,
    storage_state: &impl StorageStateStrategy,
) -> Option<Routing> {
    if !is_root_path(path) {
        // Search for potential /404.html to rewrite to
        let asset_404: Option<(Asset, Memory)> =
            storage_state.get_public_asset(ROOT_404_HTML.to_string(), None);

        match asset_404 {
            None => (),
            Some(_) => {
                return Some(Routing::Rewrite(RoutingRewrite {
                    url: path.clone(),
                    asset: asset_404,
                    source: ROOT_PATH.to_string(),
                    status_code: RESPONSE_STATUS_CODE_404,
                }));
            }
        }

        // Search for potential /index.html to rewrite to
        let asset_index: Option<(Asset, Memory)> =
            storage_state.get_public_asset(ROOT_INDEX_HTML.to_string(), None);

        match asset_index {
            None => (),
            Some(_) => {
                return Some(Routing::Rewrite(RoutingRewrite {
                    url: path.clone(),
                    asset: asset_index,
                    source: ROOT_PATH.to_string(),
                    status_code: RESPONSE_STATUS_CODE_200,
                }));
            }
        }
    }

    None
}

fn get_routing_redirect(
    path: &FullPath,
    storage_state: &impl StorageStateStrategy,
) -> Option<Routing> {
    let config = storage_state.get_config();
    let redirect = redirect_url(path, &config);

    match redirect {
        None => (),
        Some(redirect) => {
            return Some(Routing::Redirect(RoutingRedirect {
                url: path.clone(),
                redirect,
                iframe: config.unwrap_iframe(),
            }));
        }
    }

    None
}

fn get_routing_redirect_raw(
    url: &String,
    req_headers: &[HeaderField],
    storage_state: &impl StorageStateStrategy,
) -> Option<Routing> {
    let raw = req_headers.iter().any(|HeaderField(key, value)| {
        key.eq_ignore_ascii_case("Host") && RAW_DOMAINS.iter().any(|domain| value.contains(domain))
    });

    let config = storage_state.get_config();

    if raw {
        let allow_raw_access = config.unwrap_raw_access();

        match allow_raw_access {
            StorageConfigRawAccess::Deny => {
                return Some(Routing::RedirectRaw(RoutingRedirectRaw {
                    redirect_url: format!("https://{}.icp0.io{}", id().to_text(), url),
                    iframe: config.unwrap_iframe(),
                }));
            }
            StorageConfigRawAccess::Allow => (),
        }
    }

    None
}
