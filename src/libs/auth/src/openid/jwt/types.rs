pub(crate) mod token {
    use candid::Deserialize;
    use serde::Serialize;

    #[derive(Debug, Clone, Deserialize, Serialize)]
    pub struct Claims {
        pub iss: String,
        pub sub: String,
        pub aud: String,
        pub exp: Option<u64>,
        pub nbf: Option<u64>,
        pub iat: Option<u64>,

        pub email: Option<String>,
        pub name: Option<String>,
        pub picture: Option<String>,

        pub nonce: Option<String>,
    }

    #[derive(Clone, Deserialize)]
    pub struct UnsafeClaims {
        pub iss: Option<String>,
    }
}

pub mod cert {
    use candid::{CandidType, Deserialize};
    use serde::Serialize;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Jwk {
        // Key type, e.g. "RSA".
        // https://tools.ietf.org/html/rfc7517#section-4.1
        pub kty: JwkType,

        // Algorithm, e.g. "RS256".
        // https://tools.ietf.org/html/rfc7517#section-4.4
        pub alg: Option<String>,

        // Used to select which key in the JWKS to use.
        // https://tools.ietf.org/html/rfc7517#section-4.5
        pub kid: Option<String>,

        // Type-Specific Key Properties.
        // https://tools.ietf.org/html/rfc7517#section-4
        #[serde(flatten)]
        pub params: JwkParams,
    }

    // Supported types for the JSON Web Key `kty` property.
    // https://www.iana.org/assignments/jose/jose.xhtml#web-key-types
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum JwkType {
        // Elliptic Curve.
        #[serde(rename = "EC")]
        Ec,
        // RSA.
        #[serde(rename = "RSA")]
        Rsa,
        // Octet sequence.
        #[serde(rename = "oct")]
        Oct,
        // Octet string key pairs.
        #[serde(rename = "OKP")]
        Okp,
    }

    // Algorithm-specific parameters for JSON Web Keys.
    // https://tools.ietf.org/html/rfc7518#section-6
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    #[serde(untagged)]
    pub enum JwkParams {
        // Elliptic Curve parameters.
        Ec(JwkParamsEc),

        // RSA parameters.
        Rsa(JwkParamsRsa),

        // Octet Sequence parameters used to represent symmetric keys.
        Oct(JwkParamsOct),

        // Octet Key Pairs parameters.
        Okp(JwkParamsOkp),
    }

    // Parameters for Elliptic Curve Keys.
    // https://tools.ietf.org/html/rfc7518#section-6.2
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct JwkParamsEc {
        // Identifies the cryptographic curve used with the key.
        // https://tools.ietf.org/html/rfc7518#section-6.2.1.1
        pub crv: String, // Curve

        // The `x` coordinate for the Elliptic Curve point as a base64url-encoded
        // value.
        // https://tools.ietf.org/html/rfc7518#section-6.2.1.2
        pub x: String, // X Coordinate

        // The `y` coordinate for the Elliptic Curve point as a base64url-encoded
        // value.
        // https://tools.ietf.org/html/rfc7518#section-6.2.1.3
        pub y: String, // Y Coordinate

                       // The Elliptic Curve private key as a base64url-encoded value.
                       // https://tools.ietf.org/html/rfc7518#section-6.2.2.1
                       // pub d: Option<String>, // ECC Private Key
                       // Unused in this implementation.
    }

    // Parameters for RSA Keys.
    // https://tools.ietf.org/html/rfc7518#section-6.3
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct JwkParamsRsa {
        // The modulus (part of the RSA public key).
        // https://datatracker.ietf.org/doc/html/rfc7518#section-6.3.1.1
        pub n: String,

        // The exponent (the other part of the RSA public key).
        // https://datatracker.ietf.org/doc/html/rfc7518#section-6.3.1.2
        pub e: String,
        // Other optional parameters describe private keys
        // which are not used in this implementation.
        // https://datatracker.ietf.org/doc/html/rfc7518#section-6.2.2
    }

    // Parameters for Symmetric Keys.
    // https://tools.ietf.org/html/rfc7518#section-6.4
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct JwkParamsOct {
        // The symmetric key as a base64url-encoded value.
        // https://tools.ietf.org/html/rfc7518#section-6.4.1
        pub k: String, // Key Value
    }

    // Parameters for Octet Key Pairs.
    // https://tools.ietf.org/html/rfc8037#section-2
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct JwkParamsOkp {
        // The subtype of the key pair.
        // https://tools.ietf.org/html/rfc8037#section-2
        pub crv: String, // Key SubType

        // The public key as a base64url-encoded value.
        // https://tools.ietf.org/html/rfc8037#section-2
        pub x: String, // Public Key

                       // The private key as a base64url-encoded value.
                       // https://tools.ietf.org/html/rfc8037#section-2
                       // pub d: Option<String>,
                       // Unused in this implementation.
    }

    // JSON Web Key Set
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct Jwks {
        pub keys: Vec<Jwk>,
    }
}

pub(crate) mod errors {
    use candid::{CandidType, Deserialize};
    use serde::Serialize;

    #[derive(CandidType, Serialize, Deserialize, Debug)]
    pub enum JwtFindProviderError {
        BadSig(String),
        BadClaim(String),
        NoMatchingProvider,
    }

    #[derive(CandidType, Serialize, Deserialize, Debug)]
    pub enum JwtFindKidError {
        BadSig(String),
        BadClaim(String),
        MissingKid,
    }

    #[derive(CandidType, Serialize, Deserialize, Debug)]
    pub enum JwtVerifyError {
        MissingKid,
        NoKeyForKid,
        WrongKeyType,
        BadSig(String),
        BadClaim(String),
    }

    #[derive(CandidType, Serialize, Deserialize, Debug)]
    pub enum JwtHeaderError {
        BadSig(String),
        BadClaim(String),
    }
}
