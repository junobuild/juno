pub mod jwt {
    use serde::Deserialize;

    #[derive(Debug, Clone, Deserialize)]
    pub struct Claims {
        pub iss: String,
        pub sub: String,
        pub aud: String,
        pub exp: Option<u64>,
        pub nbf: Option<u64>,
        pub iat: Option<u64>,

        // extras
        pub email: Option<String>,
        pub name: Option<String>,
        pub picture: Option<String>,

        pub nonce: Option<String>,
    }

    pub struct OpenIdCredentialKey {
        pub iss: String,
        pub sub: String,
    }

    /// TODO: ???
    /// Minimal JWK entry fetched (e.g., from Google/Apple/Auth0) off-chain.
    #[derive(Deserialize)]
    pub struct Jwk {
        pub kid: Option<String>,
        pub n: String,
        pub e: String,
    }

    #[derive(Deserialize)]
    pub struct Jwks {
        pub keys: Vec<Jwk>,
    }
}
