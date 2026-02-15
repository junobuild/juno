import type { SatelliteDid } from '$declarations';
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

export const isOpenIdUser = (user: User): user is User<'google'> | User<'github'> =>
	user?.data?.provider === 'google' || user?.data?.provider === 'github';
