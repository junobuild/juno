<script lang="ts">
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import type { Canister } from '$lib/types/canister';
	import type { Principal } from '@dfinity/principal';

	export let canisterId: Principal;

	let warning = false;
	const syncCanister = ({ id, data }: Canister) => {
		if (id !== canisterId.toText()) {
			return;
		}

		warning = data?.warning ?? false;
	};
</script>

<svelte:window on:junoSyncCanister={({ detail: { canister } }) => syncCanister(canister)} />

{#if warning}
	<p><IconWarning /> <slot /></p>
{/if}

<style lang="scss">
	@use '../../styles/mixins/info';

	p {
		@include info.warning;
	}
</style>
