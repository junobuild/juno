import type { TestIds } from '$lib/types/test-id';

export const testIds = {
	auth: {
		signInDev: 'btn-sign-in-dev',
		switchDevAccount: "btn-switch-account-dev",
		inputDevIdentifier: "input-dev-identifier",
		continueDevAccount: "btn-continue-dev",
	},
	launchpad: {
		launch: 'btn-launch-first-satellite',
		launchExtraSatellite: 'btn-launch-extra-satellite',
		actions: 'btn-open-actions'
	},
	createSatellite: {
		create: 'btn-create-satellite',
		input: 'input-satellite-name',
		website: 'input-radio-satellite-website',
		application: 'input-radio-satellite-application',
		continue: 'btn-continue-overview'
	},
	satelliteOverview: {
		visit: 'link-visit-satellite',
		copySatelliteId: 'btn-copy-satellite-id'
	},
	navbar: {
		openWallet: 'btn-open-wallet',
		getIcp: 'btn-get-icp',
		getCycles: 'btn-get-cycles'
	},
	createAnalytics: {
		navLink: 'link-analytics-dashboard',
		launch: 'btn-launch-analytics',
		create: 'btn-create-analytics',
		close: 'btn-close-analytics-wizard'
	},
	wizard: {
		closeInsufficientFunds: 'btn-close-insufficient-funds'
	}
} as const satisfies TestIds;
