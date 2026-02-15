import {
	listDocs,
	type ListDocsParams,
	type ListDocsResult
} from '$lib/services/satellite/_list-docs.services';
import type { User } from '$lib/types/user';
import { toKeyUser } from '$lib/utils/user.utils';

export const listUsers = async (params: ListDocsParams): Promise<ListDocsResult<User>> => {
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
