<script lang="ts">
	import type { PrincipalText } from '@dfinity/zod-schemas';
	import type { MissionControlDid } from '$declarations';
	import CanisterSubnets from '$lib/components/canister/display/CanisterSubnets.svelte';
	import CanisterMonitoringDefaultStrategy from '$lib/components/canister/monitoring/CanisterMonitoringDefaultStrategy.svelte';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import WalletPicker from '$lib/components/wallet/WalletPicker.svelte';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { JunoModalDetail } from '$lib/types/modal';

	interface Props {
		selectedWallet: SelectedWallet | undefined;
		subnetId: PrincipalText | undefined;
		monitoringStrategy?: MissionControlDid.CyclesMonitoringStrategy | undefined;
		detail: JunoModalDetail;
		withMonitoring?: boolean;
	}

	let {
		selectedWallet = $bindable(),
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

	<WalletPicker filterMissionControlZeroBalance bind:selectedWallet />

	<CanisterSubnets bind:subnetId />

	{#if withMonitoring}
		<CanisterMonitoringDefaultStrategy {detail} bind:monitoringStrategy />
	{/if}
</Collapsible>
