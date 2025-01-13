<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Monitoring } from '$declarations/mission_control/mission_control.did';
	import MonitoringSentence from '$lib/components/modals/MonitoringSentence.svelte';
	import MonitoringDisabled from '$lib/components/monitoring/MonitoringDisabled.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { fromNullishNullable } from '$lib/utils/did.utils';

	interface Props {
		monitoring: Monitoring | undefined;
	}

	let { monitoring }: Props = $props();

	let monitoringStrategy = $derived(
		fromNullishNullable(fromNullishNullable(monitoring?.cycles)?.strategy)
	);
</script>

<div>
	{#if nonNullish(monitoringStrategy)}
		<Value>
			{#snippet label()}
				{$i18n.monitoring.auto_refill}
			{/snippet}

			<p><MonitoringSentence {monitoringStrategy} /></p>
		</Value>
	{:else}
		<MonitoringDisabled {monitoring} loading={false} />
	{/if}
</div>
