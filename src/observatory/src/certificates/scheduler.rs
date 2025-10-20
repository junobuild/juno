use crate::certificates::update::schedule_certificate_update;
use crate::memory::state::services::with_openid_mut;
use crate::types::state::{OpenId, OpenIdProvider, OpenIdScheduler};

pub fn start_openid_scheduler() {
    with_openid_mut(|openid| {
        let openid = openid.get_or_insert_with(OpenId::default);

        let cfg = openid
            .schedulers
            .entry(OpenIdProvider::Google)
            .or_insert_with(OpenIdScheduler::default);

        if cfg.enabled {
            return;
        }

        cfg.enabled = true;

        schedule_certificate_update(OpenIdProvider::Google, None);
    });
}

pub fn stop_openid_scheduler() {
    with_openid_mut(|openid| {
        if let Some(openid) = openid {
            if let Some(cfg) = openid.schedulers.get_mut(&OpenIdProvider::Google) {
                cfg.enabled = false;
            }
        }
    });
}
