<script lang="ts">
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import type { CanisterIcStatus } from '$lib/types/canister';
	import type { Principal } from '@dfinity/principal';

	export let canisterId: Principal;

	let cyclesWarning = false;
	let heapWarning = false;

	const syncCanister = ({ id, data }: CanisterIcStatus) => {
		if (id !== canisterId.toText()) {
			return;
		}

		cyclesWarning = data?.warning?.cycles === true ?? false;

		// Disabled for now, a bit too much in your face given that wasm memory cannot be shrink. We can always activate this warning if necessary, therefore I don't remove the code.
		// heapWarning = data?.warning?.heap === true ?? false;
	};
</script>

<svelte:window on:junoSyncCanister={({ detail: { canister } }) => syncCanister(canister)} />

{#if cyclesWarning}
	<p><IconWarning /> <slot name="cycles" /></p>
{/if}

{#if heapWarning}
	<p><IconWarning /> <slot name="heap" /></p>
{/if}

<style lang="scss">
	@use '../../styles/mixins/info';

	p {
		@include info.warning;
	}
</style>
