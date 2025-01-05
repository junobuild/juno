<script lang="ts">
	import type { MonitoringConfig } from '$declarations/mission_control/mission_control.did';
	import CanisterMonitoringDefaultStrategy from '$lib/components/canister/CanisterMonitoringDefaultStrategy.svelte';
	import CanisterSubnets from '$lib/components/canister/CanisterSubnets.svelte';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { PrincipalText } from '$lib/types/itentity';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';
	import type { Option } from '$lib/types/utils';

	interface Props {
		subnetId: PrincipalText | undefined;
		useDefaultStrategy: boolean | undefined;
		detail: JunoModalDetail;
	}

	let { subnetId = $bindable(), useDefaultStrategy = $bindable(), detail }: Props = $props();
</script>

<Collapsible>
	<svelte:fragment slot="header">{$i18n.core.advanced_options}</svelte:fragment>

	<CanisterSubnets bind:subnetId />

	<CanisterMonitoringDefaultStrategy bind:useDefaultStrategy {detail} />
</Collapsible>
