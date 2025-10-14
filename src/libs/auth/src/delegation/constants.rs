// === Hardcoded Google JWKS ===
// These are public Google keys fetched from
// https://www.googleapis.com/oauth2/v3/certs
// (Updated occasionally; you can refresh manually later)
// curl https://www.googleapis.com/oauth2/v3/certs -s | jq
pub const GOOGLE_JWKS: &str = r#"
{
  "keys": [
    {
      "kid": "c8ab71530972bba20b49f78a09c9852c43ff9118",
      "n": "vG5pJE-wQNbH7tvZU3IgjdeHugdw2x5eXPe47vOP3dIy4d9HnCWSTroJLtPYA1SFkcl8FlgrgWspCGBzJ8gwMo81Tk-5hX2pWXsNKrOH8R01jFqIn_UBwhmqU-YDde1R4w9upLzwNyl9Je_VY65EKrMOZG9u4UYtzTkNFLf1taBe0gIM20VSAcClUhTGpE3MX9lXxQqN3Hoybja7C_SZ8ymcnB5h-20ynZGgQybZRU43KcZkIMK2YKkLd7Tn4UQeSRPbmlbm5a0zbs5GpcYB7MONYh7MD16FTS72-tYKX-kDh3NltO6HQsV9pfoOi7qJrFaYWP3AHd_h7mWTHIkNjQ",
      "kty": "RSA",
      "use": "sig",
      "e": "AQAB",
      "alg": "RS256"
    },
    {
      "use": "sig",
      "kty": "RSA",
      "e": "AQAB",
      "alg": "RS256",
      "kid": "fb9f9371d5755f3e383a40ab3a172cd8baca517f",
      "n": "to2hcsFNHKquhCdUzXWdP8yxnGqxFWJlRT7sntBgp47HwxB9HFc-U_AB1JT8xe1hwDpWTheckoOfpLgo7_ROEsKpVJ_OXnotL_dgNwbprr-T_EFJV7qOEdHL0KmrnN-kFNLUUSqSChPYVh1aEjlPfXg92Yieaaz2AMMtiageZrKoYnrGC0z4yPNYFj21hO1x6mvGIjmpo6_fe91o-buZNzzkmYlGsFxdvUxYAvgk-5-7D10UTTLGh8bUv_BQT3aRFiVRS5d07dyCJ4wowzxYlPSM6lnfUlvHTWyPL4JysMGeu-tbPA-5QvwCdSGpfWFQbgMq9NznBtWb99r1UStpBQ"
    }
  ]
}
"#;
