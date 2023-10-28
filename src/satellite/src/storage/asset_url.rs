use crate::rules::types::rules::Memory;
use crate::storage::rewrites::{redirect_url, rewrite_url};
use crate::storage::state::get_config;
use crate::storage::store::get_public_asset;
use crate::storage::types::http_request::{MapUrl, PublicAsset, Routing};
use crate::storage::types::state::FullPath;
use crate::storage::types::store::Asset;
use crate::storage::url::{map_alternative_paths, map_url};

pub fn get_public_asset_for_url(
    url: String,
    include_alternative_routing: bool,
) -> Result<PublicAsset, &'static str> {
    if url.is_empty() {
        return Err("No url provided.");
    }

    // The certification considers, and should only, the path of the URL. If query parameters, these should be omitted in the certificate.
    // Likewise the memory contains only assets indexed with their respective path.
    // e.g.
    // url: /hello/something?param=123
    // path: /hello/something

    let MapUrl { path, token } = map_url(&url)?;

    // ⚠️ Limitation: requesting an url without extension try to resolve first a corresponding asset
    // e.g. /.well-known/hello -> try to find /.well-known/hello.html
    // Therefore if a file without extension is uploaded to the storage, it is important to not upload an .html file with the same name next to it or a folder/index.html
    let alternative_asset = get_alternative_asset(&path, &token);
    match alternative_asset {
        None => (),
        Some(alternative_asset) => {
            return Ok(PublicAsset {
                url: path.clone(),
                asset: Some(alternative_asset),
                routing: Routing::Default,
            });
        }
    }

    // We return the asset that matches the effective path
    let asset: Option<(Asset, Memory)> = get_public_asset(path.clone(), token.clone());

    match asset {
        None => (),
        Some(_) => {
            return Ok(PublicAsset {
                url: path,
                asset,
                routing: Routing::Default,
            });
        }
    }

    if include_alternative_routing {
        // Search for potential redirect
        let redirect_asset = get_public_asset_for_url_redirect(&path);

        match redirect_asset {
            None => (),
            Some(redirect_asset) => {
                return Ok(redirect_asset);
            }
        }

        // Search for potential rewrite
        let rewrite_asset = get_public_asset_for_url_rewrite(&path, &token);

        match rewrite_asset {
            None => (),
            Some(rewrite_asset) => {
                return Ok(rewrite_asset);
            }
        }
    }

    Ok(PublicAsset {
        url: path,
        asset: None,
        routing: Routing::Default,
    })
}

fn get_alternative_asset(path: &String, token: &Option<String>) -> Option<(Asset, Memory)> {
    let alternative_paths = map_alternative_paths(path);

    for alternative_path in alternative_paths {
        let asset: Option<(Asset, Memory)> = get_public_asset(alternative_path, token.clone());

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

fn get_public_asset_for_url_rewrite(
    path: &FullPath,
    token: &Option<String>,
) -> Option<PublicAsset> {
    // If we have found no asset, we try a rewrite rule
    // This is for example useful for single-page app to redirect all urls to /index.html
    let rewrite = rewrite_url(path, &get_config());

    match rewrite {
        None => (),
        Some(rewrite) => {
            // Search for rewrite configured as an alternative path
            // e.g. rewrite /demo/* to /sample
            let rewrite_asset = get_alternative_asset(&rewrite, token);

            match rewrite_asset {
                None => (),
                Some(_) => {
                    return Some(PublicAsset {
                        url: path.clone(),
                        asset: rewrite_asset,
                        routing: Routing::Rewrite(rewrite),
                    });
                }
            }

            // Rewrite is maybe configured as an absolute path
            // e.g. write /demo/* to /sample.html
            let rewrite_absolute_asset: Option<(Asset, Memory)> =
                get_public_asset(rewrite.clone(), token.clone());

            match rewrite_absolute_asset {
                None => (),
                Some(_) => {
                    return Some(PublicAsset {
                        url: path.clone(),
                        asset: rewrite_absolute_asset,
                        routing: Routing::Rewrite(rewrite),
                    });
                }
            }
        }
    }

    None
}

fn get_public_asset_for_url_redirect(path: &FullPath) -> Option<PublicAsset> {
    let redirect = redirect_url(path, &get_config());

    match redirect {
        None => (),
        Some(redirect) => {
            return Some(PublicAsset {
                url: path.clone(),
                asset: None,
                routing: Routing::Redirect(redirect),
            });
        }
    }

    None
}
