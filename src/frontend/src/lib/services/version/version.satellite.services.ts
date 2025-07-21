import { reloadVersion } from '$lib/services/version/_version.reload.services';
import type { Principal } from '@dfinity/principal';

export const reloadSatelliteVersion = async ({ satelliteId }: { satelliteId: Principal }) => {
	await reloadVersion({
		canisterId: satelliteId
	});
};
