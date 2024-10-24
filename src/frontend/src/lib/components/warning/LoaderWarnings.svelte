<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterWarnings from '$lib/components/canister/CanisterWarnings.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		canisterId: Principal;
		cycles?: Snippet;
		heap?: Snippet;
	}

	let { canisterId, cycles, heap }: Props = $props();
</script>

<Canister {canisterId} segment="mission_control" display={false} />

<CanisterWarnings {canisterId}>
	{#snippet cycles()}
		{@render cycles?.()}
	{/snippet}
	{#snippet heap()}
		{@render heap?.()}
	{/snippet}
</CanisterWarnings>
