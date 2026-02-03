pub mod state {
    use candid::Deserialize;
    use serde::Serialize;
    use junobuild_auth::openid::types::provider::OpenIdAutomationProvider;

    /// A unique key for identifying an automation token.
    /// Used to prevent replay attack
    /// The key will be parsed to `provider#jti`.
    #[derive(Serialize, Deserialize)]
    pub struct AutomationTokenKey {
        pub provider: OpenIdAutomationProvider,
        pub jti: String,
    }

}