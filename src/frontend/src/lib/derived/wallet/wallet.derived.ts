import {
	missionControlId,
	missionControlIdLoaded,
	missionControlIdNotLoaded
} from '$lib/derived/console/account.mission-control.derived';
import { devId } from '$lib/derived/dev.derived';
import type { WalletId } from '$lib/schemas/wallet.schema';
import { isNullish, nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';
import type { Option } from '$lib/types/utils';

export const walletIds: Readable<Option<WalletId[]>> = derived(
	[missionControlId, missionControlIdNotLoaded, devId],
	([$missionControlId, $missionControlIdNotLoaded, $devId]) => {
		if (isNullish($devId)) {
			return null;
		}

		if ($missionControlIdNotLoaded) {
			return undefined;
		}

		return [
			{ owner: $devId },
			...(nonNullish($missionControlId) ? [{ owner: $missionControlId }] : [])
		];
	}
);
