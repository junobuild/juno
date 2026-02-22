import { listDocs as listDocsApi } from '$lib/api/satellites.api';
import { listDocs008 } from '$lib/api/satellites.deprecated.api';
import { SATELLITE_v0_0_9 } from '$lib/constants/version.constants';
import { isSatelliteFeatureSupported } from '$lib/services/_feature.services';
import {
	listDocs,
	type ListDocsParams,
	type ListDocsResult
} from '$lib/services/satellite/_list-docs.services';
import type { User } from '$lib/types/user';
import { toKeyUser } from '$lib/utils/user.utils';

export const listUsers = async ({
	satelliteId,
	...params
}: ListDocsParams): Promise<ListDocsResult<User>> => {
	const newestListDocs = isSatelliteFeatureSupported({
		satelliteId,
		requiredMinVersion: SATELLITE_v0_0_9
	});

	const listFn = newestListDocs ? listDocsApi : listDocs008;

	const { items, matches_length, items_length } = await listDocs({
		...params,
		satelliteId,
		listFn,
		collection: '#user'
	});

	const users: [string, User][] = [];

	for (const item of items) {
		const user = await toKeyUser(item);
		users.push(user);
	}

	return {
		items: users,
		matches_length,
		items_length
	};
};
