<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Snippet } from 'svelte';
	import { canisterMonitoringUncertifiedStore } from '$lib/stores/canister-monitoring.store';
	import type { CanisterMonitoringData } from '$lib/types/canister';

	interface Props {
		canisterId: Principal;
		children: Snippet;
		monitoringData: CanisterMonitoringData | undefined;
	}

	let { children, canisterId, monitoringData = $bindable(undefined) }: Props = $props();

	let canister = $derived($canisterMonitoringUncertifiedStore?.[canisterId.toText()]?.data);

	$effect(() => {
		monitoringData = canister?.data;
	});
</script>

{@render children()}
