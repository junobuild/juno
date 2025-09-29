import { listDocs } from '$lib/api/satellites.api';
import { listDocs008 } from '$lib/api/satellites.deprecated.api';
import { SATELLITE_v0_0_9 } from '$lib/constants/version.constants';
import { isSatelliteFeatureSupported } from '$lib/services/feature.services';
import type { OptionIdentity } from '$lib/types/itentity';
import type { ListParams } from '$lib/types/list';
import type { User } from '$lib/types/user';
import { toKeyUser } from '$lib/utils/user.utils';
import type { Principal } from '@dfinity/principal';

export const listUsers = async ({
	startAfter,
	satelliteId,
	filter,
	order,
	identity
}: Pick<ListParams, 'startAfter' | 'filter' | 'order'> & {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<{
	users: [string, User][];
	matches_length: bigint;
	items_length: bigint;
}> => {
	const newestListDocs = isSatelliteFeatureSupported({
		satelliteId,
		requiredMinVersion: SATELLITE_v0_0_9
	});

	const list = newestListDocs ? listDocs : listDocs008;

	const { items, matches_length, items_length } = await list({
		collection: '#user',
		satelliteId,
		params: {
			startAfter,
			order: order ?? {
				desc: true,
				field: 'created_at'
			},
			filter
		},
		identity
	});

	const users: [string, User][] = [];

	for (const item of items) {
		const user = await toKeyUser(item);
		users.push(user);
	}

	return {
		users,
		matches_length,
		items_length
	};
};