<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { CyclesMonitoringStrategy } from '$declarations/mission_control/mission_control.did';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		missionControl: { monitored: boolean; strategy: CyclesMonitoringStrategy | undefined };
		onyes: () => void;
		onno: () => void;
	}

	let { missionControl, onyes, onno }: Props = $props();
</script>

<h2>{$i18n.monitoring.mission_control_strategy}</h2>

<p>
	{#if missionControl.monitored && nonNullish(missionControl.strategy)}
		{i18nFormat($i18n.monitoring.mission_control_existing_strategy, [
			{
				placeholder: '{0}',
				value: formatTCycles(missionControl.strategy.BelowThreshold.min_cycles)
			},
			{
				placeholder: '{1}',
				value: formatTCycles(missionControl.strategy.BelowThreshold.fund_cycles)
			}
		])}
	{:else}
		{$i18n.monitoring.no_mission_control_strategy}
	{/if}
</p>

<div class="toolbar">
	<button type="button" onclick={onno} disabled={$isBusy}>
		{$i18n.core.no}
	</button>

	<button type="button" onclick={onyes} disabled={$isBusy}>
		{$i18n.core.yes}
	</button>
</div>
