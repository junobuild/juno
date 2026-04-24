<script lang="ts">
	import { fade } from 'svelte/transition';
	import MissionControlOverviewActions from '$lib/components/mission-control/MissionControlOverviewActions.svelte';
	import MissionControlRuntimeActions from '$lib/components/mission-control/MissionControlRuntimeActions.svelte';
	import CanisterOverview from '$lib/components/modules/canister/display/CanisterOverview.svelte';
	import CanisterSubnet from '$lib/components/modules/canister/display/CanisterSubnet.svelte';
	import SegmentVersion from '$lib/components/modules/segments/SegmentVersion.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { MissionControlId as MissionControlIdType } from '$lib/types/mission-control';
	import MissionControlId from '$lib/components/mission-control/MissionControlId.svelte';

	interface Props {
		missionControlId: MissionControlIdType;
	}

	let { missionControlId }: Props = $props();
</script>

{#if $authSignedIn}
	<div class="card-container with-title">
		<span class="title">{$i18n.satellites.overview}</span>

		<div class="columns-3 fit-column-1">
			<div class="id">
				<div>
					<MissionControlId {missionControlId} />
				</div>

				<CanisterSubnet canisterId={missionControlId} />
			</div>

			<div>
				<SegmentVersion version={$missionControlVersion?.current} />
			</div>
		</div>
	</div>

	<MissionControlOverviewActions {missionControlId} />

	<div class="card-container with-title" in:fade>
		<span class="title">{$i18n.monitoring.runtime}</span>

		<div class="columns-3">
			<CanisterOverview canisterId={missionControlId} segment="mission_control" />
		</div>
	</div>

	<MissionControlRuntimeActions {missionControlId} />
{/if}

<style lang="scss">
	.id {
		max-width: 80%;
	}

	.card-container:last-of-type {
		margin: var(--padding-4x) 0 0;
	}
</style>
