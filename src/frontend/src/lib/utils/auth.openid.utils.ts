import type {
	AuthenticationConfigOpenId,
	OpenIdAuthProviderConfig,
	OpenIdDelegationProvider
} from '$declarations/satellite/satellite.did';

export const findProviderGoogle = (
	openid: AuthenticationConfigOpenId | undefined
): [OpenIdDelegationProvider, OpenIdAuthProviderConfig] | undefined =>
	openid?.providers.find(([key]) => 'Google' in key);

export const findProviderGitHub = (
	openid: AuthenticationConfigOpenId | undefined
): [OpenIdDelegationProvider, OpenIdAuthProviderConfig] | undefined =>
	openid?.providers.find(([key]) => 'GitHub' in key);
