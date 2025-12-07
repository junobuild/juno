<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Principal } from '@icp-sdk/core/principal';
	import Canister from '$lib/components/canister/Canister.svelte';
	import type { CanisterData, CanisterWarning } from '$lib/types/canister';
	import type { Option } from '$lib/types/utils';

	interface Props {
		warnings: CanisterWarning | undefined;
		data: CanisterData | undefined;
		canisterId: Option<Principal>;
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
