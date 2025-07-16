<script lang="ts">
	import UpgradeDockLoader from '$lib/components/upgrade/list/UpgradeDockLoader.svelte';
	import UpgradeMissionControl from '$lib/components/upgrade/list/UpgradeMissionControl.svelte';
	import UpgradeOrbiter from '$lib/components/upgrade/list/UpgradeOrbiter.svelte';
	import UpgradeSatellite from '$lib/components/upgrade/list/UpgradeSatellite.svelte';
	import { satellitesStore } from '$lib/derived/satellites.derived';
	import { hasPendingUpgrades } from '$lib/derived/upgrade.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	let innerWidth = $state(0);

	let colspan = $derived(innerWidth >= 768 ? 5 : innerWidth >= 576 ? 4 : 3);
</script>

<svelte:window bind:innerWidth />

<UpgradeDockLoader {missionControlId}>
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th class="tools"></th>
					<th> {$i18n.upgrade.modules} </th>
					<th class="current"> {$i18n.upgrade.current} </th>
					<th> {$i18n.upgrade.release} </th>
					<th class="source"> {$i18n.upgrade.source} </th>
				</tr>
			</thead>

			<tbody>
				<UpgradeMissionControl />

				{#each $satellitesStore ?? [] as satellite (satellite.satellite_id.toText())}
					<UpgradeSatellite {satellite} />
				{/each}

				<UpgradeOrbiter />

				{#if $hasPendingUpgrades !== undefined && $hasPendingUpgrades === false}
					<tr><td {colspan}><span class="no-upgrade">{$i18n.upgrade.no_upgrades}</span></td></tr>
				{/if}
			</tbody>
		</table>
	</div>
</UpgradeDockLoader>

<style lang="scss">
	@use '../../../styles/mixins/media';

	table {
		table-layout: auto;
	}

	.current {
		display: none;

		@include media.min-width(small) {
			display: table-cell;
		}
	}

	.source {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
		}
	}

	.tools {
		width: 60px;
	}

	.no-upgrade {
		white-space: normal;
	}
</style>
