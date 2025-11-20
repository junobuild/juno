use serde::Deserialize;

#[derive(Deserialize)]
#[serde(tag = "kty")] // drive shape from "kty"
pub enum JwkJson {
    #[serde(rename = "RSA")]
    Rsa {
        alg: Option<String>,
        kid: Option<String>,
        n: String,
        e: String,
    },
    #[serde(rename = "EC")]
    Ec {
        alg: Option<String>,
        kid: Option<String>,
        crv: String,
        x: String,
        y: String,
    },
    #[serde(rename = "oct")]
    Oct {
        alg: Option<String>,
        kid: Option<String>,
        k: String,
    },
    #[serde(rename = "OKP")]
    Okp {
        alg: Option<String>,
        kid: Option<String>,
        crv: String,
        x: String,
    },
}

#[derive(Deserialize)]
pub struct JwksJson {
    pub keys: Vec<JwkJson>,
}
