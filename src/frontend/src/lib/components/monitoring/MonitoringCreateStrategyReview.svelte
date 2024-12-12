<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
    import type {Principal} from "@dfinity/principal";
    import type {Orbiter, Satellite} from "$declarations/mission_control/mission_control.did";
    import Value from "$lib/components/ui/Value.svelte";
    import Input from "$lib/components/ui/Input.svelte";

    interface Props {
        missionControlId: Principal;
        selectedMissionControl: boolean;
        selectedSatellites: [Principal, Satellite][];
        selectedOrbiters: [Principal, Orbiter][];
        minCycles: bigint;
        fundCycles: bigint;
        onsubmit: () => void;
    }

    let {missionControlId, selectedMissionControl, selectedSatellites, selectedOrbiters, minCycles, fundCycles}: Props = $props();
</script>

<h2>{$i18n.monitoring.title}</h2>

<p>{$i18n.monitoring.review_info}</p>

<Value>
    {#snippet label()}
        Selected Modules:
    {/snippet}

    <ul>
        {#if selectedMissionControl}
            <li>{$i18n.mission_control.title} <small>{missionControlId.toText()}</small></li>
        {/if}
    </ul>

    <Input
            name="cycles"
            inputType="icp"
            required
            bind:value={minTCycles}
            placeholder={$i18n.canisters.amount_cycles}
    />
</Value>