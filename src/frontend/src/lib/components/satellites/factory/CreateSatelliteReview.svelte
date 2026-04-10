<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import type { PrincipalText } from '@junobuild/schema';
	import { nonNullish } from '@dfinity/utils';
	import type { MissionControlDid } from '$declarations';
	import MonitoringSentence from '$lib/components/modals/monitoring/MonitoringSentence.svelte';

	interface Props {
		satelliteName: string | undefined;
		satelliteKind: 'website' | 'application' | undefined;
		subnetId: PrincipalText | undefined;
		monitoringStrategy: MissionControlDid.CyclesMonitoringStrategy | undefined;
	}

	let { satelliteName, satelliteKind, subnetId, monitoringStrategy }: Props = $props();
</script>

<h2>{$i18n.core.review}</h2>

<Value>
	{#snippet label()}
		{$i18n.satellites.satellite_name}
	{/snippet}

	<p>{satelliteName ?? ''}</p>
</Value>

<Value>
	{#snippet label()}
		{$i18n.core.config}
	{/snippet}

	<p>
		{satelliteKind === 'application'
			? $i18n.satellites.application_hint
			: $i18n.satellites.website_hint}
	</p>
</Value>

{#if nonNullish(subnetId)}
	<Value>
		{#snippet label()}
			{$i18n.canisters.subnet}
		{/snippet}

		<p>{subnetId}</p>
	</Value>
{/if}

{#if nonNullish(monitoringStrategy)}
    <Value>
        {#snippet label()}
			{$i18n.monitoring.auto_refill}
        {/snippet}

		<MonitoringSentence {monitoringStrategy} />
    </Value>
{/if}
