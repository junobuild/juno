import { listDocs, satelliteVersion } from '$lib/api/satellites.api';
import { listDocs008 } from '$lib/api/satellites.deprecated.api';
import { authStore } from '$lib/stores/auth.store';
import type { ListParams } from '$lib/types/list';
import type { User } from '$lib/types/user';
import type { Principal } from '@dfinity/principal';
import { fromArray } from '@junobuild/utils';
import { compare } from 'semver';
import { get } from 'svelte/store';

export const listUsers = async ({
	startAfter,
	satelliteId
}: Pick<ListParams, 'startAfter'> & { satelliteId: Principal }): Promise<{
	users: [string, User][];
	matches_length: bigint;
	items_length: bigint;
}> => {
	const identity = get(authStore).identity;

	const version = await satelliteVersion({ satelliteId, identity });
	const list = compare(version, '0.0.9') >= 0 ? listDocs : listDocs008;

	const { items, matches_length, items_length } = await list({
		collection: '#user',
		satelliteId,
		params: {
			startAfter,
			order: {
				desc: true,
				field: 'created_at'
			},
			filter: {}
		},
		identity
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
		matches_length,
		items_length
	};
};
