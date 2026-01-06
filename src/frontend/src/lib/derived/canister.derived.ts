import { pageId } from '$lib/derived/app/page.derived.svelte';
import { consoleCanisters } from '$lib/derived/console/segments.derived';
import type { SegmentCanister } from '$lib/types/segment';
import type { Option } from '$lib/types/utils';
import { isNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const canisterStore: Readable<Option<SegmentCanister>> = derived(
	[consoleCanisters, pageId],
	([$consoleCanisters, $pageId]) => {
		if (isNullish($pageId)) {
			return null;
		}

		if (!('canisterId' in $pageId)) {
			return null;
		}

		// Canisters are not loaded yet
		if ($consoleCanisters === undefined) {
			return undefined;
		}

		const canister = ($consoleCanisters ?? []).find(
			({ canisterId }) => canisterId.toText() === $pageId.canisterId
		);

		return canister === undefined ? null : canister;
	}
);
