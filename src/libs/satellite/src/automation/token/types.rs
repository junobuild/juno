pub mod state {
    use candid::Deserialize;
    use junobuild_auth::openid::types::provider::OpenIdAutomationProvider;
    use junobuild_utils::DocDataPrincipal;
    use serde::Serialize;

    /// A unique key for identifying an automation token.
    /// Used to prevent replay attack
    /// The key will be parsed to `provider#jti`.
    #[derive(Serialize, Deserialize)]
    pub struct AutomationTokenKey {
        pub provider: OpenIdAutomationProvider,
        pub jti: String,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "camelCase", deny_unknown_fields)]
    pub struct AutomationTokenData {
        pub controller_id: DocDataPrincipal,
    }
}
