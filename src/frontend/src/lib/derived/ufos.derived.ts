import { consoleUfos } from '$lib/derived/console/segments.derived';
import { mctrlUfos } from '$lib/derived/mission-control/mission-control-ufos.derived';
import type { Ufo, UfoUi } from '$lib/types/ufo';
import { metadataUi } from '$lib/utils/metadata-ui.utils';
import { sortUfos } from '$lib/utils/ufo.utils';
import { derived } from 'svelte/store';

export const ufos = derived(
	[consoleUfos, mctrlUfos],
	([$consoleUfos, $mctrlUfosStore]): Ufo[] | undefined => {
		// Not yet fully loaded
		if ($consoleUfos === undefined || $mctrlUfosStore === undefined) {
			return undefined;
		}

		return [
			...$consoleUfos.filter(
				({ ufo_id }) =>
					($mctrlUfosStore ?? []).find(({ ufo_id: id }) => id.toText() === ufo_id.toText()) ===
					undefined
			),
			...($mctrlUfosStore ?? [])
		];
	}
);

export const ufosLoaded = derived([ufos], ([$ufosStore]) => $ufosStore !== undefined);

export const ufosNotLoaded = derived([ufosLoaded], ([$ufosLoaded]) => !$ufosLoaded);

export const sortedUfos = derived([ufos], ([$ufosStore]) => ($ufosStore ?? []).sort(sortUfos));

export const sortedUfoUis = derived([sortedUfos], ([$sortedUfos]) =>
	$sortedUfos.map<UfoUi>((ufo) => ({
		...ufo,
		metadata: metadataUi(ufo)
	}))
);
