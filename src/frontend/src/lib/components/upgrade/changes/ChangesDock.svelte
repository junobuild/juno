<script lang="ts">
    import UpgradeMissionControl from '$lib/components/upgrade/dock/UpgradeMissionControl.svelte';
    import UpgradeOrbiter from '$lib/components/upgrade/dock/UpgradeOrbiter.svelte';
    import UpgradeSatellite from '$lib/components/upgrade/dock/UpgradeSatellite.svelte';
    import { satellitesStore } from '$lib/derived/satellites.derived';
    import { hasPendingUpgrades } from '$lib/derived/upgrade.derived';
    import { i18n } from '$lib/stores/i18n.store';
    import ChangesDockLoader from "$lib/components/upgrade/changes/ChangesDockLoader.svelte";
    import {openSatellitesProposals} from "$lib/derived/proposals.derived";
    import {satelliteStore} from "$lib/derived/satellite.derived";
    import {nonNullish} from "@dfinity/utils";

    let innerWidth = $state(0);

    let colspan = $derived(innerWidth >= 768 ? 5 : innerWidth >= 576 ? 4 : 3);

    let satelliteId = $derived($satelliteStore?.satellite_id.toText());

    let proposals = $derived(nonNullish(satelliteId) ? $openSatellitesProposals[satelliteId] : undefined)
</script>

<svelte:window bind:innerWidth />

<ChangesDockLoader>
    <div class="table-container">
        <table>
            <thead>
            <tr>
                <th class="tools"></th>
                <th> {$i18n.satellites.satellite} </th>
                <th class="current"> {$i18n.upgrade_dock.current} </th>
                <th> {$i18n.upgrade_dock.release} </th>
                <th class="source"> {$i18n.upgrade_dock.source} </th>
            </tr>
            </thead>

            <tbody>

            {#each proposals ?? [] as proposal (proposal[0])}
                <span>{proposal[0]}</span>
            {/each}

            {#if $hasPendingUpgrades !== undefined && $hasPendingUpgrades === false}
                <tr
                ><td {colspan}><span class="no-upgrade">{$i18n.upgrade_dock.no_upgrades}</span></td></tr
                >
            {/if}
            </tbody>
        </table>
    </div>
</ChangesDockLoader>

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
