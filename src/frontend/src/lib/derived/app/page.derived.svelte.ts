import { page } from '$app/state';
import type { SatelliteIdText } from '$lib/types/satellite';
import type { UfoIdText } from '$lib/types/ufo';
import { notEmptyString } from '@dfinity/utils';
import { type Readable, writable } from 'svelte/store';

type PageIdStoreData =
	| {
			satelliteId?: SatelliteIdText;
			ufoId?: UfoIdText;
	  }
	| undefined;

type PageIdStore = Readable<PageIdStoreData>;

const initPageIdStore = (): PageIdStore => {
	const { subscribe, set } = writable<PageIdStoreData>(undefined);

	$effect.root(() => {
		$effect(() => {
			const satelliteId = page.data?.satellite;
			const ufoId = page.data?.ufo;

			set(
				notEmptyString(satelliteId) || notEmptyString(ufoId)
					? {
							...(notEmptyString(satelliteId) && { satelliteId }),
							...(notEmptyString(ufoId) && { ufoId })
						}
					: undefined
			);
		});
	});

	return {
		subscribe
	};
};

export const pageId = initPageIdStore();
