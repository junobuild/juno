<script lang="ts">
    import type {MissionControlId} from "$lib/types/mission-control";
    import SpinnerParagraph from "$lib/components/ui/SpinnerParagraph.svelte";
    import {i18n} from "$lib/stores/i18n.store";

    interface Props {
        missionControlId: MissionControlId;
    }

    let { missionControlId }: Props = $props();

    let loading: 'in_progress' | 'done' | 'error' = $state('in_progress');
</script>

{#if loading === 'in_progress'}
    <div class="loading">
        <SpinnerParagraph>{$i18n.core.loading}</SpinnerParagraph>
    </div>
{:else}
    TODO
{/if}