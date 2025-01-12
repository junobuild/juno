<script lang="ts">
	import type { CyclesMonitoringStrategy } from '$declarations/mission_control/mission_control.did';
	import CanisterMonitoringDefaultStrategy from '$lib/components/canister/CanisterMonitoringDefaultStrategy.svelte';
	import CanisterSubnets from '$lib/components/canister/CanisterSubnets.svelte';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail } from '$lib/types/modal';
	import type { PrincipalText } from '$lib/types/principal';

	interface Props {
		subnetId: PrincipalText | undefined;
		monitoringStrategy: CyclesMonitoringStrategy | undefined;
		detail: JunoModalDetail;
	}

	let { subnetId = $bindable(), monitoringStrategy = $bindable(), detail }: Props = $props();
</script>

<Collapsible>
	<svelte:fragment slot="header">{$i18n.core.advanced_options}</svelte:fragment>

	<CanisterSubnets bind:subnetId />

	<CanisterMonitoringDefaultStrategy bind:monitoringStrategy {detail} />
</Collapsible>
