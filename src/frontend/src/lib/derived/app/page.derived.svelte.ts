import { page } from '$app/state';
import type { CanisterIdText } from '$lib/types/canister';
import type { SatelliteIdText } from '$lib/types/satellite';
import { notEmptyString } from '@dfinity/utils';
import { type Readable, writable } from 'svelte/store';

type PageIdStoreData =
	| {
			satelliteId: SatelliteIdText;
	  }
	| { canisterId: CanisterIdText }
	| undefined;

export type PageIdStore = Readable<PageIdStoreData>;

const initPageIdStore = (): PageIdStore => {
	const { subscribe, set } = writable<PageIdStoreData>(undefined);

	$effect.root(() => {
		$effect(() => {
			const satelliteId = page.data?.satellite;
			const canisterId = page.data?.canister;

			set(
				notEmptyString(satelliteId)
					? { satelliteId }
					: notEmptyString(canisterId)
						? { canisterId }
						: undefined
			);
		});
	});

	return {
		subscribe
	};
};

export const pageId = initPageIdStore();
