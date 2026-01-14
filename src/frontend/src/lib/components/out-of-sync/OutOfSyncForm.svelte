<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
	import OutOfSyncSegments from '$lib/components/out-of-sync/OutOfSyncSegments.svelte';
	import GridEqualNot from '$lib/components/ui/GridEqualNot.svelte';
	import { mctrlSortedSatellites } from '$lib/derived/mission-control/mission-control-satellites.derived';
	import {
		consoleOrbiter,
		consoleSortedSatellites
	} from '$lib/derived/console/segments.derived';
	import { mctrlOrbiter } from '$lib/derived/mission-control/mission-control-orbiters.derived';

	interface Props {
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let { onsubmit }: Props = $props();

	$inspect($consoleSortedSatellites, $mctrlSortedSatellites)
</script>

<h2>{$i18n.out_of_sync.title}</h2>

<p>{$i18n.out_of_sync.description}</p>

<form {onsubmit}>
	<div class="columns">
		<OutOfSyncSegments satellites={$consoleSortedSatellites} orbiter={$consoleOrbiter}>
			{#snippet label()}
				{$i18n.out_of_sync.console}
			{/snippet}
		</OutOfSyncSegments>

		<GridEqualNot small />

		<OutOfSyncSegments satellites={$mctrlSortedSatellites} orbiter={$mctrlOrbiter}>
			{#snippet label()}
				{$i18n.mission_control.title}
			{/snippet}
		</OutOfSyncSegments>
	</div>

	<button class="action" type="submit">
		{$i18n.core.submit}
	</button>
</form>

<style lang="scss">
	@use '../../styles/mixins/grid';

	.columns {
		@include grid.two-columns-with-arrow;
	}

	.identifier {
		margin: 0 0 var(--padding);
	}
</style>
