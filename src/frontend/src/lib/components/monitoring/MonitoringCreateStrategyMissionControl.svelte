<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { MissionControlDid } from '$declarations';
	import MonitoringStepYesNo from '$lib/components/monitoring/MonitoringStepYesNo.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		missionControl: {
			monitored: boolean;
			strategy: MissionControlDid.CyclesMonitoringStrategy | undefined;
		};
		onyes: () => void;
		onno: () => void;
	}

	let { missionControl, onyes, onno }: Props = $props();
</script>

<MonitoringStepYesNo {onno} {onyes}>
	<h2>{$i18n.monitoring.mission_control_strategy}</h2>

	{#if missionControl.monitored && nonNullish(missionControl.strategy)}
		<p>
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
		</p>

		<p><Html text={$i18n.monitoring.mission_control_existing_strategy_question} /></p>
	{:else}
		<p>{$i18n.monitoring.no_mission_control_strategy}</p>

		<p><Html text={$i18n.monitoring.no_mission_control_strategy_question} /></p>
	{/if}
</MonitoringStepYesNo>
