import type { CollectionType } from '$declarations/satellite/satellite.did';

export interface UserUsage {
	changes_count: number;
}

export interface UserUsageCollection {
	collection: string;
	collectionType: CollectionType;
	maxChangesPerUser: number | undefined;
	usage: UserUsage | undefined;
}
