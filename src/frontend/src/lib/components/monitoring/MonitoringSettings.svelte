<script lang="ts">
    import {i18n} from "$lib/stores/i18n.store.js";
    import type {Principal} from "@dfinity/principal";
    import Value from "$lib/components/ui/Value.svelte";
    import {emit} from "$lib/utils/events.utils";

    interface Props {
        missionControlId: Principal;
    }

    let { missionControlId }: Props = $props();

    const openModal = () => {
        emit({
            message: 'junoModal',
            detail: {
                type: 'set_bulk_monitoring_strategy'
            }
        });
    }
</script>

<div class="card-container with-title">
    <span class="title">{$i18n.core.settings}</span>

    <div class="content">
        <Value>
            {#snippet label()}
                Mission Control
            {/snippet}

            Not monitored.
        </Value>


        <Value>
            {#snippet label()}
                Satellites
            {/snippet}

            5 monitored, 2 disabled.
        </Value>

        <Value>
            {#snippet label()}
                Orbiter
            {/snippet}

            Not monitored.
        </Value>
    </div>
</div>

<button onclick={openModal}>Set strategy</button>