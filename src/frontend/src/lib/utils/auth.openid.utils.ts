import type { AuthenticationConfigOpenId } from '$declarations/satellite/satellite.did';
import type { OpenIdAuthProvider } from '$lib/types/auth';

export const findProviderGoogle = (
	openid: AuthenticationConfigOpenId | undefined
): OpenIdAuthProvider | undefined => openid?.providers.find(([key]) => 'Google' in key);

export const findProviderGitHub = (
	openid: AuthenticationConfigOpenId | undefined
): OpenIdAuthProvider | undefined => openid?.providers.find(([key]) => 'GitHub' in key);
