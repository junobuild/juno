<script lang="ts">
	import { encodeSnapshotId } from '@dfinity/ic-management';
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { snapshot } from '$declarations/ic/ic.did';
	import SnapshotActions from '$lib/components/snapshot/SnapshotActions.svelte';
	import SnapshotDelete from '$lib/components/snapshot/SnapshotDelete.svelte';
	import SnapshotsLoader from '$lib/components/snapshot/SnapshotsLoader.svelte';
	import SnapshotsRefresh from '$lib/components/snapshot/SnapshotsRefresh.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import SkeletonTableRow from '$lib/components/ui/SkeletonTableRow.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { snapshotStore } from '$lib/stores/snapshot.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSegmentWithLabel, Segment } from '$lib/types/canister';
	import type { Snapshots } from '$lib/types/progress-snapshot';
	import type { Option } from '$lib/types/utils';
	import { formatToDate } from '$lib/utils/date.utils';
	import { emit } from '$lib/utils/events.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatBytes } from '$lib/utils/number.utils';

	interface Props {
		canisterId: Principal;
		segment: Segment;
		segmentLabel: string;
	}

	let { canisterId, segment, segmentLabel }: Props = $props();

	let snapshots: Option<Snapshots> = $derived($snapshotStore?.[canisterId.toText()]);

	let segmentWithLabel: CanisterSegmentWithLabel = $derived({
		canisterId: canisterId.toText(),
		segment,
		label: segmentLabel
	});

	const openCreateModal = () => {
		if (isNullish(snapshots)) {
			toasts.error({ text: $i18n.errors.snapshot_not_loaded });
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'create_snapshot',
				detail: {
					segment: segmentWithLabel
				}
			}
		});
	};

	// Currently the IC supports only one snapshot per canister.
	let existingSnapshot: snapshot | undefined = $derived(snapshots?.[0]);

	const openRestoreModal = () => {
		if (isNullish(existingSnapshot)) {
			toasts.error({ text: $i18n.errors.snapshot_not_selected });
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'restore_snapshot',
				detail: {
					segment: segmentWithLabel,
					snapshot: existingSnapshot
				}
			}
		});
	};

	let deleteSnapshotVisible = $state(false);
	const openDeletePopover = () => (deleteSnapshotVisible = true);

	let hasExistingSnapshots = $derived((snapshots?.length ?? 0) > 0);
</script>

<SnapshotsLoader {canisterId}>
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th class="tools"></th>
					<th class="backup">
						<div class="actions">
							<span>{$i18n.canisters.backup}</span>

							<SnapshotsRefresh {canisterId} />
						</div>
					</th>
					<th class="size"> {$i18n.canisters.size} </th>
					<th> {$i18n.canisters.timestamp} </th>
				</tr>
			</thead>

			<tbody>
				{#if snapshots !== undefined}
					{#each snapshots ?? [] as snapshot}
						<tr>
							<td
								><SnapshotActions
									ondelete={openDeletePopover}
									onrestore={openRestoreModal}
									onreplace={openCreateModal}
								/></td
							>
							<td><Identifier small={false} identifier={`0x${encodeSnapshotId(snapshot.id)}`} /></td
							>
							<td>{formatBytes(Number(snapshot.total_size))}</td>
							<td>{formatToDate(snapshot.taken_at_timestamp)}</td>
						</tr>
					{/each}

					{#if snapshots === null || snapshots?.length === 0}
						<tr in:fade
							><td colspan="4"
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
					<SkeletonTableRow colspan={4} />
				{/if}
			</tbody>
		</table>
	</div>

	{#if !hasExistingSnapshots && $snapshotStore !== undefined}
		<button in:fade onclick={openCreateModal}>{$i18n.core.create}</button>
	{/if}

	<SnapshotDelete
		{canisterId}
		{existingSnapshot}
		{segmentLabel}
		bind:visible={deleteSnapshotVisible}
	/>
</SnapshotsLoader>

<style lang="scss">
	@use '../../styles/mixins/media';

	.tools {
		width: 88px;
	}

	.backup {
		@include media.min-width(medium) {
			width: 25%;
		}
	}

	.size {
		@include media.min-width(medium) {
			width: 25%;
		}
	}

	.table-container {
		margin: var(--padding-8x) 0 var(--padding-2x);
	}

	.actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
