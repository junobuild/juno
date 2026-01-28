use crate::types::state::{HeapState, OpenId, State};
use crate::upgrade::types::upgrade::{
    UpgradeHeapState, UpgradeOpenId, UpgradeOpenIdProvider, UpgradeState,
};
use junobuild_auth::openid::types::provider::OpenIdProvider;

impl From<UpgradeState> for State {
    fn from(upgrade: UpgradeState) -> Self {
        State {
            stable: upgrade.stable,
            heap: upgrade.heap.into(),
        }
    }
}

impl From<UpgradeHeapState> for HeapState {
    fn from(upgrade: UpgradeHeapState) -> Self {
        HeapState {
            controllers: upgrade.controllers,
            env: upgrade.env,
            openid: upgrade.openid.map(|openid| openid.into()),
            rates: upgrade.rates,
        }
    }
}

impl From<UpgradeOpenId> for OpenId {
    fn from(upgrade: UpgradeOpenId) -> Self {
        OpenId {
            certificates: upgrade
                .certificates
                .into_iter()
                .map(|(provider, cert)| (provider.into(), cert))
                .collect(),
            schedulers: upgrade
                .schedulers
                .into_iter()
                .map(|(provider, scheduler)| (provider.into(), scheduler))
                .collect(),
        }
    }
}

impl From<UpgradeOpenIdProvider> for OpenIdProvider {
    fn from(old: UpgradeOpenIdProvider) -> Self {
        match old {
            UpgradeOpenIdProvider::Google => OpenIdProvider::Google,
            UpgradeOpenIdProvider::GitHub => OpenIdProvider::GitHubProxy,
        }
    }
}
