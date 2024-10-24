<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Snippet } from 'svelte';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import type { CanisterIcStatus } from '$lib/types/canister';

	interface Props {
		canisterId: Principal;
		cycles?: Snippet;
		heap?: Snippet;
	}

	let { canisterId, cycles, heap }: Props = $props();

	let cyclesWarning = $state(false);
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

<svelte:window onjunoSyncCanister={({ detail: { canister } }) => syncCanister(canister)} />

{#if cyclesWarning}
	<p><IconWarning /> {@render cycles?.()}</p>
{/if}

{#if heapWarning}
	<p><IconWarning /> {@render heap?.()}</p>
{/if}

<style lang="scss">
	@use '../../styles/mixins/info';

	p {
		@include info.warning;
	}
</style>
