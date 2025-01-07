<script lang="ts">
	import { fade } from 'svelte/transition';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import {
		missionControlMonitoring,
		missionControlSettingsLoaded
	} from '$lib/derived/mission-control.derived';
	import MonitoringSentence from '$lib/components/modals/MonitoringSentence.svelte';
	import { fromNullable, nonNullish } from '@dfinity/utils';

	let monitoringStrategy = $derived(
		fromNullable(fromNullable($missionControlMonitoring?.cycles ?? [])?.strategy ?? [])
	);
</script>

{#if $missionControlSettingsLoaded}
	<div in:fade>
		<Value>
			{#snippet label()}
				{$i18n.monitoring.default_strategy}
			{/snippet}

			<p>
				{#if nonNullish(monitoringStrategy)}
					<MonitoringSentence {monitoringStrategy} />
				{:else}
					&ZeroWidthSpace;
				{/if}
			</p>
		</Value>
	</div>
{/if}
