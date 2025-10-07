import type { TestIds } from '$lib/types/test-id';

export const testIds = {
	auth: {
		signIn: 'btn-sign-in'
	},
	createSatellite: {
		launch: 'btn-launch-satellite',
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
		getIcp: 'btn-get-icp'
	},
	createAnalytics: {
		navLink: 'nav-analytics',
		launch: 'btn-launch-analytics',
		create: 'btn-create-analytics',
		close: 'btn-close-analytics-wizard'
	}
} as const satisfies TestIds;
