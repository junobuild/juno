import { defineConsoleConfig } from '@junobuild/config';

/** @type {import('@junobuild/config').JunoConsoleConfig} */
export default defineConsoleConfig(({ mode }) => ({
	id: 'cokmz-oiaaa-aaaal-aby6q-cai',
	source: 'build',
	...(['development', 'production'].includes(mode) && {
		authentication: {
			google: {
				clientId:
					mode === 'production'
						? '370155500951-42lqfeh5e71m9766s04hhp1ub4jfc1sd.apps.googleusercontent.com'
						: '370155500951-s1hflh8hgj60it9o1teebuk9sqsrobt2.apps.googleusercontent.com',
				delegation: {
					// Like identities derived by Internet Identity, those derived with OpenID
					// are allowed to interact with any canister on the Internet Computer.
					allowedTargets: null,
					sessionDuration: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000) // 7 days in nanoseconds
				}
			}
		}
	})
}));
