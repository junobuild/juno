<script lang="ts">
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import CanisterSubnet from '$lib/components/canister/CanisterSubnet.svelte';
	import OrbiterOverviewActions from '$lib/components/orbiter/OrbiterOverviewActions.svelte';
	import SegmentVersion from '$lib/components/segments/SegmentVersion.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import CanisterSyncData from "$lib/components/canister/CanisterSyncData.svelte";
	import type {CanisterSyncData as CanisterSyncDataType} from "$lib/types/canister";
	import OrbiterMonitoringActions from "$lib/components/orbiter/OrbiterMonitoringActions.svelte";

	interface Props {
		orbiter: Orbiter;
	}

	let { orbiter }: Props = $props();

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

<OrbiterOverviewActions {orbiter} {canister} />

<div class="card-container with-title">
	<span class="title">{$i18n.monitoring.title}</span>

	<div class="columns-3">
		<CanisterOverview
			canisterId={orbiter.orbiter_id}
			segment="orbiter"
			heapWarningLabel={$i18n.canisters.warning_orbiter_heap_memory}
		/>
	</div>
</div>

<OrbiterMonitoringActions {orbiter} {canister} />

<style lang="scss">
	.id {
		max-width: 80%;
	}

	.card-container:last-of-type {
		margin: var(--padding-4x) 0 0;
	}
</style>
