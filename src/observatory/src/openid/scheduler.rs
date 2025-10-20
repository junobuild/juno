use crate::memory::state::services::with_openid_mut;
use crate::openid::certificate::schedule_certificate_update;
use crate::types::state::{OpenId, OpenIdProvider, OpenIdScheduler};

pub fn start_openid_scheduler() -> Result<(), String> {
    with_openid_mut(|openid| {
        let openid = openid.get_or_insert_with(OpenId::default);

        let cfg = openid
            .schedulers
            .entry(OpenIdProvider::Google)
            .or_insert_with(OpenIdScheduler::default);

        if cfg.enabled {
            return Err("OpenID scheduler already running".to_string());
        }

        cfg.enabled = true;

        schedule_certificate_update(OpenIdProvider::Google, None);

        Ok(())
    })
}

pub fn stop_openid_scheduler() -> Result<(), String> {
    with_openid_mut(|openid| {
        if let Some(openid) = openid {
            if let Some(cfg) = openid.schedulers.get_mut(&OpenIdProvider::Google) {
                if !cfg.enabled {
                    return Err("OpenID scheduler is not running".to_string());
                }

                cfg.enabled = false;
                return Ok(());
            }
        }

        Err("OpenID scheduler not initialized".to_string())
    })
}
