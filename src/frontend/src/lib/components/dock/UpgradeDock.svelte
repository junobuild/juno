<script lang="ts">
	import UpgradeDockLoader from '$lib/components/dock/UpgradeDockLoader.svelte';
	import UpgradeMissionControl from '$lib/components/dock/UpgradeMissionControl.svelte';
	import UpgradeOrbiter from '$lib/components/dock/UpgradeOrbiter.svelte';
	import UpgradeSatellite from '$lib/components/dock/UpgradeSatellite.svelte';
	import { satellitesStore } from '$lib/derived/satellites.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import UpgradeFilter from "$lib/components/dock/UpgradeFilter.svelte";

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();
</script>

<UpgradeDockLoader {missionControlId}>
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th class="tools"></th>
					<th> {$i18n.upgrade_dock.modules} </th>
					<th> {$i18n.upgrade_dock.current} </th>
					<th> {$i18n.upgrade_dock.release} </th>
					<th> {$i18n.upgrade_dock.source} </th>
				</tr>
			</thead>

			<tbody>
				<UpgradeMissionControl />

				{#each $satellitesStore ?? [] as satellite (satellite.satellite_id.toText())}
					<UpgradeSatellite {satellite} />
				{/each}

				<UpgradeOrbiter />
			</tbody>
		</table>
	</div>
</UpgradeDockLoader>

<style lang="scss">
	table {
		table-layout: auto;
	}

	.tools {
		width: 60px;
	}
</style>
