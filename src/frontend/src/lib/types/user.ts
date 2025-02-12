import type { Doc } from '$declarations/satellite/satellite.did';

export type Provider = 'internet_identity' | 'nfid';

export interface UserData {
	provider?: Provider;
	banned?: "indefinitely";
}

export type User = Omit<Doc, 'data'> & {
	data: UserData;
};
