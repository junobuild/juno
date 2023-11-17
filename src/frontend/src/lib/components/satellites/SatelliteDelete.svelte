<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type { Canister } from '$lib/types/canister';
	import { nonNullish } from '@dfinity/utils';
	import { emit } from '$lib/utils/events.utils';
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	export let satellite: Satellite;
	export let canister: Canister | undefined = undefined;

	const dispatch = createEventDispatcher();

	const onDelete = () => {
		dispatch('junoDelete');

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
	};

	let enabled = false;
	$: enabled =
		nonNullish(canister) && nonNullish(canister.data) && canister.data.status === 'running';
</script>

{#if enabled}
	<div in:fade>
		<button class="menu" on:click={onDelete}><IconDelete /> {$i18n.core.delete}</button>
	</div>
{/if}
