<script lang="ts">
	import type { PrincipalText } from '@dfinity/zod-schemas';
	import type { CyclesMonitoringStrategy } from '$declarations/mission_control/mission_control.did';
	import CanisterMonitoringDefaultStrategy from '$lib/components/canister/CanisterMonitoringDefaultStrategy.svelte';
	import CanisterSubnets from '$lib/components/canister/CanisterSubnets.svelte';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail } from '$lib/types/modal';

	interface Props {
		subnetId: PrincipalText | undefined;
		monitoringStrategy: CyclesMonitoringStrategy | undefined;
		detail: JunoModalDetail;
	}

	let { subnetId = $bindable(), monitoringStrategy = $bindable(), detail }: Props = $props();
</script>

<Collapsible>
	{#snippet header()}
		{$i18n.core.advanced_options}
	{/snippet}

	<CanisterSubnets bind:subnetId />

	<CanisterMonitoringDefaultStrategy {detail} bind:monitoringStrategy />
</Collapsible>
