use junobuild_auth::openid::types::provider::OpenIdProvider;

pub fn assert_openid_request_rates(provider: &OpenIdProvider) -> Result<(), String> {
    if !matches!(provider, OpenIdProvider::Google) {
        return Err("Unsupported provider.".to_string());
    }
    
    
    
    Ok(())
}