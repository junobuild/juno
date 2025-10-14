// We have to use getrandom v0.2 as a dependency because jsonwebtoken won't compile without it.
// In our implementation, randomness is never used for verifying JWTs.
// To avoid any accidental use while we initialize and use getrandom v0.3,
// we provide a v0.2 implementation that always fails at runtime.
//
// Source: https://github.com/ilbertt/ic-react-native-jwt-auth/blob/main/src/ic_backend/src/lib.rs#L177
getrandom02::register_custom_getrandom!(always_fail);

pub fn always_fail(_buf: &mut [u8]) -> Result<(), getrandom02::Error> {
    Err(getrandom02::Error::UNSUPPORTED)
}