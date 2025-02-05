import type { CollectionType, UserUsage } from '$declarations/satellite/satellite.did';

export interface UserUsageCollection {
	collection: string;
	collectionType: CollectionType;
	maxChangesPerUser: number | undefined;
	usage: UserUsage | undefined;
}
