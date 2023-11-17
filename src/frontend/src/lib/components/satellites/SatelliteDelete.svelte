<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type { Canister } from '$lib/types/canister';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { emit } from '$lib/utils/events.utils';

	export let satellite: Satellite;

	let canister: Canister | undefined = undefined;

	const onSyncCanister = (syncCanister: Canister) => {
		if (syncCanister.id !== satellite.satellite_id.toText()) {
			return;
		}

		canister = syncCanister;
	};

	const onDelete = () =>
		emit({
			message: 'junoModal',
			detail: {
				type: 'delete_satellite',
				detail: {
					satellite,
					cycles: canister?.data?.cycles ?? 0n
				}
			}
		});
</script>

<svelte:window on:junoSyncCanister={({ detail: { canister } }) => onSyncCanister(canister)} />

<button on:click={onDelete} disabled={isNullish(canister)}>{$i18n.core.delete}</button>
