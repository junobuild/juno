import type { SignInFn } from '$lib/types/auth';
import { requestJwt } from '@junobuild/auth';

export const signInWithGoogle: SignInFn = async () => {
	const {
		location: { origin }
	} = window;

	await requestJwt({
		google: {
			redirect: {
				redirectUrl: `${origin}/auth/callback`
			}
		}
	});
};
