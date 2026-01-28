use junobuild_auth::openid::types::provider::OpenIdProvider;
use junobuild_auth::state::types::state::{AuthenticationHeapState, OpenIdState};
use crate::types::state::{HeapState, State};
use crate::upgrade::types::upgrade::{UpgradeAuthenticationHeapState, UpgradeHeapState, UpgradeOpenIdProvider, UpgradeState};

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
            authentication: upgrade.authentication.map(|auth| auth.into()),
            controllers: upgrade.controllers,
            mission_controls: upgrade.mission_controls,
            payments: upgrade.payments,
            invitation_codes: upgrade.invitation_codes,
            factory_fees: upgrade.factory_fees,
            factory_rates: upgrade.factory_rates,
            storage: upgrade.storage,
            releases_metadata: upgrade.releases_metadata,
        }
    }
}

impl From<UpgradeAuthenticationHeapState> for AuthenticationHeapState {
    fn from(upgrade: UpgradeAuthenticationHeapState) -> Self {
        AuthenticationHeapState {
            config: upgrade.config,
            salt: upgrade.salt,
            openid: upgrade.openid.map(|openid_state| {
                OpenIdState {
                    certificates: openid_state.certificates
                        .into_iter()
                        .map(|(provider, cert)| (provider.into(), cert))
                        .collect()
                }
            }),
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