<script lang="ts">
	import { fromNullishNullable } from '@dfinity/utils';
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import CanisterSubnet from '$lib/components/canister/CanisterSubnet.svelte';
	import CanisterSyncData from '$lib/components/canister/CanisterSyncData.svelte';
	import OrbiterOverviewActions from '$lib/components/orbiter/OrbiterOverviewActions.svelte';
	import OrbiterRuntimeActions from '$lib/components/orbiter/OrbiterRuntimeActions.svelte';
	import SegmentVersion from '$lib/components/segments/SegmentVersion.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';

	interface Props {
		orbiter: Orbiter;
	}

	let { orbiter }: Props = $props();

	let monitoring = $derived(fromNullishNullable(fromNullishNullable(orbiter.settings)?.monitoring));

	let monitoringEnabled = $derived(fromNullishNullable(monitoring?.cycles)?.enabled === true);

	let canister = $state<CanisterSyncDataType | undefined>(undefined);
</script>

<CanisterSyncData canisterId={orbiter.orbiter_id} bind:canister />

<div class="card-container with-title">
	<span class="title">{$i18n.satellites.overview}</span>

	<div class="columns-3 fit-column-1">
		<div class="id">
			<div>
				<Value>
					{#snippet label()}
						{$i18n.analytics.id}
					{/snippet}
					<Identifier identifier={orbiter.orbiter_id.toText()} shorten={false} small={false} />
				</Value>
			</div>

			<CanisterSubnet canisterId={orbiter.orbiter_id} />
		</div>

		<div>
			<SegmentVersion version={$versionStore?.orbiter?.current} />
		</div>
	</div>
</div>

<OrbiterOverviewActions {monitoringEnabled} {orbiter} />

<div class="card-container with-title">
	<span class="title">{$i18n.monitoring.runtime}</span>

	<div class="columns-3">
		<CanisterOverview
			canisterId={orbiter.orbiter_id}
			heapWarningLabel={$i18n.canisters.warning_orbiter_heap_memory}
			segment="orbiter"
		/>
	</div>
</div>

<OrbiterRuntimeActions {canister} {monitoringEnabled} {orbiter} />

<style lang="scss">
	.id {
		max-width: 80%;
	}

	.card-container:last-of-type {
		margin: var(--padding-4x) 0 0;
	}
</style>
