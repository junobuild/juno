import type { SatelliteDid } from '$lib/types/declarations';
import type { User } from '$lib/types/user';
import { fromArray } from '@junobuild/utils';

export const toKeyUser = async ([key, { data: dataArray, ...rest }]: [
	string,
	SatelliteDid.Doc
]): Promise<[string, User]> => [
	key,
	{
		data: await fromArray(dataArray),
		...rest
	}
];
