import type { CollectionType, UserUsage } from '$declarations/satellite/satellite.did';

export interface UserUsageCollection {
	collection: string;
	collectionType: CollectionType;
	usage: UserUsage | undefined;
}
