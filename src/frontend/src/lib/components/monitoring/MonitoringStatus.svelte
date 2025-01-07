<script lang="ts">
	import { fade } from 'svelte/transition';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		missionControlMonitored,
		missionControlSettingsLoaded
	} from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';

	let enabled = $derived($missionControlMonitored);
</script>

{#if $missionControlSettingsLoaded}
	<div in:fade>
		<Value>
			{#snippet label()}
				{$i18n.monitoring.auto_refill}
			{/snippet}

			<p>{enabled ? $i18n.core.enabled : $i18n.core.disabled}</p>
		</Value>
	</div>
{/if}
