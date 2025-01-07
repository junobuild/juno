<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import MonitoringSentence from '$lib/components/modals/MonitoringSentence.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		missionControlMonitoring,
		missionControlSettingsLoaded
	} from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';

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
