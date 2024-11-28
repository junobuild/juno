<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { snapshotStore } from '$lib/stores/snapshot.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { Segment } from '$lib/types/canister';
	import type { Snapshots } from '$lib/types/snapshot';
	import type { Option } from '$lib/types/utils';
	import { emit } from '$lib/utils/events.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { loadSnapshots } from '$lib/services/snapshots.services';

	interface Props {
		canisterId: Principal;
		segment: Segment;
		segmentLabel: string;
	}

	let { canisterId, segment, segmentLabel }: Props = $props();

	onMount(() => {
		loadSnapshots({
			canisterId,
			identity: $authStore.identity
		});
	});

	let snapshots: Option<Snapshots> = $derived($snapshotStore?.[canisterId.toText()]);

	const openModal = () => {
		if (isNullish(snapshots)) {
			toasts.error({ text: $i18n.errors.snapshot_not_loaded });
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'create_snapshot',
				detail: {
					segment: {
						canisterId: canisterId.toText(),
						segment,
						label: segmentLabel
					}
				}
			}
		});
	};
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th> {$i18n.canisters.backup} </th>
				<th> {$i18n.canisters.size} </th>
				<th> {$i18n.canisters.timestamp} </th>
			</tr>
		</thead>

		<tbody>
			{#if nonNullish(snapshots)}
				{#each snapshots as snapshot}{/each}

				{#if snapshots.length === 0}
					<tr in:fade
						><td colspan="3"
							>{i18nFormat($i18n.canisters.no_backup, [
								{
									placeholder: '{0}',
									value: segmentLabel
								}
							])}</td
						></tr
					>
				{/if}
			{:else}
				<tr><td colspan="3">&ZeroWidthSpace;</td></tr>
			{/if}
		</tbody>
	</table>
</div>

<button onclick={openModal}>{$i18n.canisters.create_a_backup}</button>

<style lang="scss">
	.table-container {
		margin: var(--padding-8x) 0 var(--padding-2x);
	}
</style>
