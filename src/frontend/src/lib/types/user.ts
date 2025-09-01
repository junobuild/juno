import type { Doc } from '$declarations/satellite/satellite.did';
import type { UserData as UserDataCore } from '@junobuild/core';

export type UserData = UserDataCore & {
	banned?: 'indefinite';
};

export type User = Omit<Doc, 'data'> & {
	data: UserData;
};
