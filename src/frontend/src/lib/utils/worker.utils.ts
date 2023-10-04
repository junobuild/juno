import { createAuthClient } from '$lib/utils/auth.utils';
import { isNullish } from '$lib/utils/utils';
import type { Identity } from '@dfinity/agent';

export const loadIdentity = async (): Promise<Identity | null> => {
	const authClient = await createAuthClient();

	if (!(await authClient.isAuthenticated())) {
		return null;
	}

	// Should never happens, AuthClient contains either an authenticated user or an anonymous user
	if (isNullish(authClient.getIdentity())) {
		return null;
	}

	if (authClient.getIdentity().getPrincipal().isAnonymous()) {
		return null;
	}

	return authClient.getIdentity();
};
