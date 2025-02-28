<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import SnapshotsLoader from '$lib/components/snapshot/SnapshotsLoader.svelte';
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

<SnapshotsLoader {canisterId}>
	{#if nonNullish(memorySize) && memorySize > 0n}
		<p in:fade>
			{formatBytes(Number(memorySize))}
			<small>{$i18n.canisters.on_snapshot}</small>
		</p>
	{/if}
</SnapshotsLoader>
