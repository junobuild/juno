use crate::rules::types::rules::Memory;
use crate::storage::constants::{
    RESPONSE_STATUS_CODE_200, RESPONSE_STATUS_CODE_404, ROOT_404_HTML, ROOT_INDEX_HTML, ROOT_PATH,
};
use crate::storage::rewrites::{is_root_path, redirect_url, rewrite_url};
use crate::storage::state::get_config;
use crate::storage::store::get_asset_store;
use crate::storage::types::http_request::{
    MapUrl, Routing, RoutingDefault, RoutingRedirect, RoutingRewrite,
};
use crate::storage::types::state::FullPath;
use crate::storage::types::store::Asset;
use crate::storage::url::{map_alternative_paths, map_url};

pub fn get_routing(
    url: String,
    include_alternative_routing: bool,
) -> Result<Routing, &'static str> {
    if url.is_empty() {
        return Err("No url provided.");
    }

    // The certification considers, and should only, the path of the URL. If query parameters, these should be omitted in the certificate.
    // Likewise the memory contains only assets indexed with their respective path.
    // e.g.
    // url: /hello/something?param=123
    // path: /hello/something

    let MapUrl { path, token } = map_url(&url)?;

    // We return the asset that matches the effective path
    let asset: Option<(Asset, Memory)> = get_asset_store(path.clone(), token.clone());

    match asset {
        None => (),
        Some(_) => {
            return Ok(Routing::Default(RoutingDefault { url: path, asset }));
        }
    }

    // ⚠️ Limitation: requesting an url without extension try to resolve first a corresponding asset
    // e.g. /.well-known/hello -> try to find /.well-known/hello.html
    // Therefore if a file without extension is uploaded to the storage, it is important to not upload an .html file with the same name next to it or a folder/index.html
    let alternative_asset = get_alternative_asset(&path, &token);
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
        let redirect = get_routing_redirect(&path);

        match redirect {
            None => (),
            Some(redirect) => {
                return Ok(redirect);
            }
        }

        // Search for potential rewrite
        let rewrite = get_routing_rewrite(&path, &token);

        match rewrite {
            None => (),
            Some(rewrite) => {
                return Ok(rewrite);
            }
        }

        // Search for potential default rewrite for HTML pages
        let root_rewrite = get_routing_root_rewrite(&path);

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

fn get_alternative_asset(path: &String, token: &Option<String>) -> Option<(Asset, Memory)> {
    let alternative_paths = map_alternative_paths(path);

    for alternative_path in alternative_paths {
        let asset: Option<(Asset, Memory)> = get_asset_store(alternative_path, token.clone());

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

fn get_routing_rewrite(path: &FullPath, token: &Option<String>) -> Option<Routing> {
    // If we have found no asset, we try a rewrite rule
    // This is for example useful for single-page app to redirect all urls to /index.html
    let rewrite = rewrite_url(path, &get_config());

    match rewrite {
        None => (),
        Some(rewrite) => {
            let (source, destination) = rewrite;

            // Search for rewrite configured as an alternative path
            // e.g. rewrite /demo/* to /sample
            let rewrite_asset = get_alternative_asset(&destination, token);

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
                get_asset_store(destination.clone(), token.clone());

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

fn get_routing_root_rewrite(path: &FullPath) -> Option<Routing> {
    if !is_root_path(path) {
        // Search for potential /404.html to rewrite to
        let asset_404: Option<(Asset, Memory)> = get_asset_store(ROOT_404_HTML.to_string(), None);

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
            get_asset_store(ROOT_INDEX_HTML.to_string(), None);

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

fn get_routing_redirect(path: &FullPath) -> Option<Routing> {
    let config = get_config();
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
