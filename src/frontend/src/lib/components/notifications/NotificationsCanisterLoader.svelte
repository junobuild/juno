<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import Canister from '$lib/components/canister/Canister.svelte';
	import type { CanisterData, CanisterWarning } from '$lib/types/canister';

	interface Props {
		warnings: CanisterWarning | undefined;
		data: CanisterData | undefined;
		canisterId: Principal | undefined;
	}

	let {
		warnings = $bindable(undefined),
		data = $bindable(undefined),
		canisterId
	}: Props = $props();

	let canisterData = $state<CanisterData | undefined>(undefined);

	$effect(() => {
		data = canisterData;
	});

	let canisterWarning = $derived(canisterData?.warning);

	$effect(() => {
		warnings = canisterWarning;
	});
</script>

{#if nonNullish(canisterId)}
	<Canister {canisterId} display={false} bind:data={canisterData} />
{/if}
