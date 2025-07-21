import { reloadVersion } from '$lib/services/version/_version.reload.services';
import type { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';

export const reloadOrbiterVersion = async ({
	orbiterId
}: {
	// Optional for convenience reason
	orbiterId?: Principal;
}) => {
	// Optional for convenience reasons.
	if (isNullish(orbiterId)) {
		return { result: 'skipped' };
	}

	await reloadVersion({
		canisterId: orbiterId
	});
};
