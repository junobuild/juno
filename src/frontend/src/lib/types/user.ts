import type { SatelliteDid } from '$declarations';
import type { UserData as UserDataCore, UserProvider } from '@junobuild/core';

export type UserData<P extends UserProvider = UserProvider> = UserDataCore<P> & {
	banned?: 'indefinite';
};

export type User<P extends UserProvider = UserProvider> = Omit<SatelliteDid.Doc, 'data'> & {
	data: UserData<P>;
};
