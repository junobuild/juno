import type { SatelliteDid } from '$declarations';
import type { UserData as UserDataCore } from '@junobuild/core';

export type UserData = UserDataCore & {
	banned?: 'indefinite';
};

export type User = Omit<SatelliteDid.Doc, 'data'> & {
	data: UserData;
};
