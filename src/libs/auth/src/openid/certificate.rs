use crate::openid::types::provider::OpenIdProvider;
use crate::strategies::AuthHeapStrategy;

fn get_or_refetch_openid_certificate(
    provider: &OpenIdProvider,
    auth_heap: &impl AuthHeapStrategy,
) -> Result<Jwks, VerifyOpenidCredentialsError> {

}