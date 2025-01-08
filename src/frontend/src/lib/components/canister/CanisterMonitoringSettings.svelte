<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import CanisterMonitoring from '$lib/components/canister/CanisterMonitoring.svelte';
	import MissionControlDataLoader from '$lib/components/mission-control/MissionControlDataLoader.svelte';
	import NoMonitoring from '$lib/components/monitoring/NoMonitoring.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import type { Segment } from '$lib/types/canister';

	interface Props {
		canisterId: Principal;
		segment: Segment;
		segmentLabel: string;
	}

	let {canisterId}: Props = $props();
</script>

{#if nonNullish($missionControlIdDerived)}
	<CanisterMonitoring canisterId={$missionControlIdDerived} segment="mission_control">
		<MissionControlDataLoader missionControlId={$missionControlIdDerived}>
			<div class="container">
				<NoMonitoring missionControlId={$missionControlIdDerived} />
			</div>
		</MissionControlDataLoader>
	</CanisterMonitoring>
{/if}

<style lang="scss">
	.container {
		margin: var(--padding-8x) 0 0;
	}
</style>
