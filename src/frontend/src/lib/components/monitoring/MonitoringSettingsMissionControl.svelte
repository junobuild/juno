<script lang="ts">
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		missionControlMonitored,
		missionControlSettingsNotLoaded
	} from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<Value>
	{#snippet label()}
		{$i18n.mission_control.title}
	{/snippet}

	{#if $missionControlSettingsNotLoaded}
		<p><SkeletonText /></p>
	{:else}
		<p>
			{$missionControlMonitored ? $i18n.monitoring.monitored : $i18n.monitoring.not_monitored}
		</p>
	{/if}
</Value>
