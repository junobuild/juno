<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { Canister } from '$lib/types/canister';
	import { nonNullish } from '@dfinity/utils';
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import { DEV_FEATURES } from '$lib/constants/constants';

	export let canister: Canister | undefined = undefined;

	const dispatch = createEventDispatcher();

	const onDelete = () => dispatch('junoDelete');
	const onTransferCycles = () => dispatch('junoTransferCycles');

	let enabled = false;
	$: enabled =
		nonNullish(canister) && nonNullish(canister.data) && canister.data.status === 'running';
</script>

{#if enabled && DEV_FEATURES}
	<div in:fade>
		<button class="menu" on:click={onDelete}><IconDelete /> {$i18n.core.delete}</button>

		<button class="menu" on:click={onTransferCycles}><IconDelete /> {$i18n.core.delete}</button>
	</div>
{/if}
