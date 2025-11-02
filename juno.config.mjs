import { defineConsoleConfig } from '@junobuild/config';

/** @type {import('@junobuild/config').JunoConsoleConfig} */
export default defineConsoleConfig(({mode}) => ({
	id: 'cokmz-oiaaa-aaaal-aby6q-cai',
	source: 'build',
	...(mode === "development" && {
		authentication: {
			google: {
				clientId: "974645854757-h6ndt2o4kqv8o63512ssdlf20gnqjb8m.apps.googleusercontent.com",
				delegation: {
					// Similarly to the identities derived by Internet Identity, we allow those
					// to target any canisters on the Internet Computer.
					allowedTargets: null
				}
			}
		}
	}),
}));
