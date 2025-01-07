<script lang="ts">
	import MonitoringSentence from '$lib/components/modals/MonitoringSentence.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlSettingsLoaded } from '$lib/derived/mission-control.derived';
</script>

<Value>
    {#snippet label()}
        {$i18n.monitoring.notifications}
    {/snippet}

    <p></p>
</Value>
