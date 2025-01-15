<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isEmptyString } from '@dfinity/utils';
	import type { Orbiter, Satellite } from '$declarations/mission_control/mission_control.did';
	import Segment from '$lib/components/segments/Segment.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { orbiterName } from '$lib/utils/orbiter.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		selectedSatellites: [Principal, Satellite][];
		selectedOrbiters: [Principal, Orbiter][];
	}

	let { selectedSatellites, selectedOrbiters }: Props = $props();
</script>

<Value>
	{#snippet label()}
		{$i18n.monitoring.selected_modules}
	{/snippet}

	<ul>
		{#each selectedSatellites as [satelliteId, satellite]}
			<li>
				<Segment id={satelliteId}>
					{satelliteName(satellite)}
				</Segment>
			</li>
		{/each}

		{#each selectedOrbiters as [orbiterId, orbiter]}
			{@const orbName = orbiterName(orbiter)}

			<li>
				<Segment id={orbiterId}>
					{isEmptyString(orbName) ? $i18n.analytics.title : orbName}
				</Segment>
			</li>
		{/each}
	</ul>
</Value>

<style lang="scss">
	ul {
		padding: var(--padding) var(--padding-2_5x) 0;
		margin: 0 0 var(--padding-2_5x);
	}

	li {
		margin: 0 0 var(--padding);
	}
</style>
