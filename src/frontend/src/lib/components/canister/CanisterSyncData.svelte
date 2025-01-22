<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Snippet } from 'svelte';
	import { canisterMonitoringUncertifiedStore } from '$lib/stores/canister-monitoring.store';
	import { canisterSyncDataUncertifiedStore } from '$lib/stores/canister-sync-data.store';
	import type { CanisterMonitoringData, CanisterSyncData } from '$lib/types/canister';

	interface Props {
		canisterId: Principal;
		children?: Snippet;
		canister: CanisterSyncData | undefined;
	}

	let { children, canisterId, canister = $bindable(undefined) }: Props = $props();

	$effect(() => {
		canister = $canisterSyncDataUncertifiedStore?.[canisterId.toText()]?.data;
	});
</script>

{@render children?.()}
