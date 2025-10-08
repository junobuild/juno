import type { SatelliteDid } from '$lib/types/declarations';

export interface UserUsage {
	changes_count: number;
}

export interface UserUsageCollection {
	collection: string;
	collectionType: SatelliteDid.CollectionType;
	maxChangesPerUser: number | undefined;
	usage: UserUsage | undefined;
}
