import { versionIdbStore } from '$lib/stores/idb.store';
import type { SatelliteVersionMetadata, VersionMetadata } from '$lib/types/version';
import type { Principal } from '@dfinity/principal';
import { update } from 'idb-keyval';

export const updateCachedVersion = async ({
	canisterId,
	value
}: {
	canisterId: Principal;
	value: Omit<VersionMetadata, 'release'> | Omit<SatelliteVersionMetadata, 'release'>;
}) => {
	const now = new Date().getTime();

	await update(
		canisterId.toText(),
		(knownMetadata) => ({
			value,
			createdAt: knownMetadata?.createdAt ?? now,
			updatedAt: now
		}),
		versionIdbStore
	);
};
