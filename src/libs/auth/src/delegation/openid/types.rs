pub trait OpenIdProvider {
    fn verify(
        &self,
        jwt: &str,
        salt: &[u8; 32],
    ) -> Result<OpenIdCredential, String>;
}

// JWT - Registered Claim Names
// https://datatracker.ietf.org/doc/html/rfc7519?utm_source=chatgpt.com#section-4.1
pub type Issuer = String;
pub type Subject = String;
pub type Audience = String;

pub struct OpenIdCredential {
    pub iss: Issuer,
    pub sub: Subject,
    pub aud: Audience,
}