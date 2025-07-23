import { versionIdbStore } from '$lib/stores/idb.store';
import { emit } from '$lib/utils/events.utils';
import type { Principal } from '@dfinity/principal';
import { del } from 'idb-keyval';

export const reloadVersion = async ({ canisterId }: { canisterId: Principal }) => {
	// For simplicity, we delete the known version and status information and restart the registry,
	// which will reload the data for that particular module only.
	await del(canisterId.toText(), versionIdbStore);

	emit({ message: 'junoReloadVersions' });
};
