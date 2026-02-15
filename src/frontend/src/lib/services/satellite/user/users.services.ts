import { listDocs, type ListDocsResult } from '$lib/services/satellite/_list-docs.services';
import type { OptionIdentity } from '$lib/types/itentity';
import type { ListParams } from '$lib/types/list';
import type { User } from '$lib/types/user';
import { toKeyUser } from '$lib/utils/user.utils';
import type { Principal } from '@icp-sdk/core/principal';

export const listUsers = async (
	params: Pick<ListParams, 'startAfter' | 'filter' | 'order'> & {
		satelliteId: Principal;
		identity: OptionIdentity;
	}
): Promise<ListDocsResult<User>> => {
	const { items, matches_length, items_length } = await listDocs({
		...params,
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
