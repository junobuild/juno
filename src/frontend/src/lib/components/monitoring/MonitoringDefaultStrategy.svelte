<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import MonitoringSentence from '$lib/components/modals/MonitoringSentence.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		missionControlConfigMonitoring,
		missionControlUserDataLoaded
	} from '$lib/derived/mission-control-user.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { fromNullishNullable } from '$lib/utils/did.utils';

	let monitoringStrategy = $derived(
		fromNullishNullable(
			fromNullishNullable($missionControlConfigMonitoring?.cycles)?.default_strategy
		)
	);
</script>

{#if $missionControlUserDataLoaded}
	<div in:fade>
		<Value>
			{#snippet label()}
				{$i18n.monitoring.default_strategy}
			{/snippet}

			<p>
				{#if nonNullish(monitoringStrategy)}
					<MonitoringSentence {monitoringStrategy} />
				{:else}
					{$i18n.core.none}
				{/if}
			</p>
		</Value>
	</div>
{/if}
