<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import CanisterSnapshotsLoader from '$lib/components/canister/CanisterSnapshotsLoader.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { snapshotStore } from '$lib/stores/snapshot.store';
	import { formatBytes } from '$lib/utils/number.utils';

	interface Props {
		canisterId: Principal;
	}

	let { canisterId }: Props = $props();

	let memorySize = $derived(
		$snapshotStore?.[canisterId.toText()]?.reduce((acc, snapshot) => acc + snapshot.total_size, 0n)
	);
</script>

<CanisterSnapshotsLoader {canisterId}>
	{#if nonNullish(memorySize) && memorySize > 0n}
		<p in:fade>
			{formatBytes(Number(memorySize))}
			<small>{$i18n.canisters.on_backup}</small>
		</p>
	{/if}
</CanisterSnapshotsLoader>
