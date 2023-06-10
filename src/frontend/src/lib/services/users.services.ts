import { listDocs, satelliteVersion } from '$lib/api/satellites.api';
import { listDocs008 } from '$lib/api/satellites.deprected.api';
import type { ListParams } from '$lib/types/list';
import type { User } from '$lib/types/user';
import { fromArray } from '$lib/utils/did.utils';
import type { Principal } from '@dfinity/principal';
import { compare } from 'semver';

export const listUsers = async ({
	startAfter,
	satelliteId
}: Pick<ListParams, 'startAfter'> & { satelliteId: Principal }): Promise<{
	users: [string, User][];
	matches_length: bigint;
}> => {
	const version = await satelliteVersion({ satelliteId });
	const list = compare(version, '0.0.9') >= 0 ? listDocs : listDocs008;

	const { items, matches_length } = await list({
		collection: '#user',
		satelliteId,
		params: {
			startAfter,
			order: {
				desc: true,
				field: 'created_at'
			},
			filter: {}
		}
	});

	const users: [string, User][] = [];

	for (const [key, item] of items) {
		const { data: dataArray, ...rest } = item;

		users.push([
			key,
			{
				data: await fromArray(dataArray),
				...rest
			}
		]);
	}

	return {
		users,
		matches_length
	};
};
