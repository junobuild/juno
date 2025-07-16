import type { Doc } from '$declarations/satellite/satellite.did';
import type { User } from '$lib/types/user';
import { fromArray } from '@junobuild/utils';

export const toKeyUser = async ([key, { data: dataArray, ...rest }]: [string, Doc]): Promise<
	[string, User]
> => [
	key,
	{
		data: await fromArray(dataArray),
		...rest
	}
];
