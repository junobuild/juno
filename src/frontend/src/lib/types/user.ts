import type { SatelliteDid } from '$lib/types/declarations';
import type { UserData as UserDataCore } from '@junobuild/core';

export type UserData = UserDataCore & {
	banned?: 'indefinite';
};

export type User = Omit<SatelliteDid.Doc, 'data'> & {
	data: UserData;
};
