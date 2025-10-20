// Google publishes a JSON Web Key Set (JWKS) at
// https://www.googleapis.com/oauth2/v3/certs. Keys are rotated periodically.
//
// The HTTP response includes an `Expires` header (a hint about the expiration),
// but new keys can appear before older ones expire.
//
// What we care about is having the JWKS that contains the *current* `kid`.
//
// During rotation, Google typically *adds* a new key (new `kid`) while
// keeping the old one for an overlap window, then removes the old key.
//
// By fetching the JWKS periodically, we maintain an in-memory cache that
// very likely already includes the active `kid` when we need it.
pub const FETCH_CERTIFICATE_INTERVAL: u64 = 60 * 15; // 15 minutes in seconds
