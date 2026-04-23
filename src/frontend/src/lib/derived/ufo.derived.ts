import { pageId } from '$lib/derived/app/page.derived.svelte.js';
import { ufos } from '$lib/derived/ufos.derived';
import type { Ufo, UfoUi } from '$lib/types/ufo';
import { metadataUi } from '$lib/utils/metadata-ui.utils';
import { isNullish } from '@dfinity/utils';
import type { Nullish } from '@dfinity/zod-schemas';
import { derived, type Readable } from 'svelte/store';

export const ufo: Readable<Nullish<Ufo>> = derived([ufos, pageId], ([$ufos, $pageId]) => {
	if (isNullish($pageId) || !('ufoId' in $pageId)) {
		return null;
	}

	// Ufos not loaded yet
	if ($ufos === undefined) {
		return undefined;
	}

	const ufo = ($ufos ?? []).find(({ ufo_id }) => ufo_id.toText() === $pageId.ufoId);

	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
	return ufo === undefined ? null : ufo;
});

export const ufoUi: Readable<Nullish<UfoUi>> = derived([ufo], ([$ufo]) => {
	if (isNullish($ufo)) {
		return $ufo;
	}

	return {
		...$ufo,
		metadata: metadataUi($ufo)
	};
});
