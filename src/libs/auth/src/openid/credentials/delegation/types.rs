pub mod interface {
    pub struct OpenIdDelegationCredentialKey<'a> {
        pub iss: &'a String,
        pub sub: &'a String,
    }

    pub struct OpenIdDelegationCredential {
        pub iss: String,
        pub sub: String,

        pub email: Option<String>,
        pub name: Option<String>,
        pub given_name: Option<String>,
        pub family_name: Option<String>,
        pub preferred_username: Option<String>,
        pub picture: Option<String>,
        pub locale: Option<String>,
    }
}
