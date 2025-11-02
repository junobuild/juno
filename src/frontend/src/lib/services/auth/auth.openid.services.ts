import { GOOGLE_CLIENT_ID } from '$lib/constants/app.constants';
import { SignInInitError } from '$lib/types/errors';
import { isNullish } from '@dfinity/utils';
import { requestJwt } from '@junobuild/auth';

export const signInWithGoogle = async () => {
	if (isNullish(GOOGLE_CLIENT_ID)) {
		throw new SignInInitError(
			'Google sign-in cannot be initialized because GOOGLE_CLIENT_ID is not configured.'
		);
	}

	const {
		location: { origin }
	} = window;

	await requestJwt({
		google: {
			redirect: {
				clientId: GOOGLE_CLIENT_ID,
				redirectUrl: `${origin}/auth/callback`
			}
		}
	});
};
