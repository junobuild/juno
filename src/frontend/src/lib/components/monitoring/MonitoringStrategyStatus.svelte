<script lang="ts">
	import { nonNullish, fromNullishNullable } from '@dfinity/utils';
	import type { Monitoring } from '$declarations/mission_control/mission_control.did';
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import MonitoringDisabled from '$lib/components/monitoring/MonitoringDisabled.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData, CanisterSyncStatus } from '$lib/types/canister';
	import { cyclesNeededForFreezingThreshold } from '$lib/utils/canister.utils';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		monitoring: Monitoring | undefined;
		canisterData: CanisterData | undefined;
		canisterSyncStatus: CanisterSyncStatus | undefined;
	}

	let { monitoring, canisterSyncStatus, canisterData }: Props = $props();

	let monitoringStrategy = $derived(
		fromNullishNullable(fromNullishNullable(monitoring?.cycles)?.strategy)
	);

	let cyclesNeeded = $derived(cyclesNeededForFreezingThreshold(canisterData?.canister));

	let cyclesTrigger = $derived(
		cyclesNeeded + (monitoringStrategy?.BelowThreshold.min_cycles ?? 0n)
	);
</script>

<div>
	{#if nonNullish(monitoringStrategy)}
		<CanisterValue rows={1} sync={canisterSyncStatus}>
			{#snippet label()}
				{$i18n.monitoring.auto_refill}
			{/snippet}

			<Html
				text={i18nFormat($i18n.monitoring.auto_refill_strategy_with_cycles_needed, [
					{
						placeholder: '{0}',
						value: formatTCycles(monitoringStrategy.BelowThreshold.fund_cycles)
					},
					{
						placeholder: '{1}',
						value: formatTCycles(cyclesTrigger)
					}
				])}
			/>
		</CanisterValue>
	{:else}
		<MonitoringDisabled loading={false} {monitoring} />
	{/if}
</div>

<style lang="scss">
	div {
		margin: 0 0 var(--padding-2_5x);
	}
</style>
