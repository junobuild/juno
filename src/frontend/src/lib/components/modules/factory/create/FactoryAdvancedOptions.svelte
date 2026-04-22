<script lang="ts">
	import type { PrincipalText } from '@junobuild/schema';
	import type { MissionControlDid } from '$declarations';
	import CanisterSubnets from '$lib/components/modules/canister/display/CanisterSubnets.svelte';
	import CanisterMonitoringDefaultStrategy from '$lib/components/modules/canister/monitoring/CanisterMonitoringDefaultStrategy.svelte';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { JunoModalDetail } from '$lib/types/modal';

	interface Props {
		subnetId: PrincipalText | undefined;
		monitoringStrategy?: MissionControlDid.CyclesMonitoringStrategy | undefined;
		detail: JunoModalDetail;
		withMonitoring?: boolean;
	}

	let {
		subnetId = $bindable(),
		monitoringStrategy = $bindable(),
		detail,
		withMonitoring = true
	}: Props = $props();
</script>

<Collapsible>
	{#snippet header()}
		{$i18n.core.advanced_options}
	{/snippet}

	<CanisterSubnets bind:subnetId />

	{#if withMonitoring}
		<CanisterMonitoringDefaultStrategy {detail} bind:monitoringStrategy />
	{/if}
</Collapsible>
