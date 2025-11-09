use crate::openid::http::types::{JwkJson, JwksJson};
use junobuild_auth::openid::jwt::types::cert::{
    Jwk, JwkParams, JwkParamsEc, JwkParamsOct, JwkParamsOkp, JwkParamsRsa, JwkType, Jwks,
};

impl From<JwkJson> for Jwk {
    fn from(j: JwkJson) -> Self {
        match j {
            JwkJson::Rsa { alg, kid, n, e } => Jwk {
                kty: JwkType::Rsa,
                alg,
                kid,
                params: JwkParams::Rsa(JwkParamsRsa { n, e }),
            },
            JwkJson::Ec {
                alg,
                kid,
                crv,
                x,
                y,
            } => Jwk {
                kty: JwkType::Ec,
                alg,
                kid,
                params: JwkParams::Ec(JwkParamsEc { crv, x, y }),
            },
            JwkJson::Oct { alg, kid, k } => Jwk {
                kty: JwkType::Oct,
                alg,
                kid,
                params: JwkParams::Oct(JwkParamsOct { k }),
            },
            JwkJson::Okp { alg, kid, crv, x } => Jwk {
                kty: JwkType::Okp,
                alg,
                kid,
                params: JwkParams::Okp(JwkParamsOkp { crv, x }),
            },
        }
    }
}

impl From<JwksJson> for Jwks {
    fn from(jwks: JwksJson) -> Self {
        Jwks {
            keys: jwks.keys.into_iter().map(Into::into).collect(),
        }
    }
}
