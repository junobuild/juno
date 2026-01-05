<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import type { Snippet } from 'svelte';
	import { canisterSyncDataStore } from '$lib/stores/ic-mgmt/canister-sync-data.store';
	import type { CanisterSyncData } from '$lib/types/canister';

	interface Props {
		canisterId: Principal;
		children?: Snippet;
		canister: CanisterSyncData | undefined;
	}

	let { children, canisterId, canister = $bindable(undefined) }: Props = $props();

	$effect(() => {
		canister = $canisterSyncDataStore?.[canisterId.toText()]?.data;
	});
</script>

{@render children?.()}
