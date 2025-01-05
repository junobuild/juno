<script lang="ts">
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CyclesMonitoringStrategy } from '$declarations/mission_control/mission_control.did';

	interface Props {
		monitoringStrategy: CyclesMonitoringStrategy;
	}

	let { monitoringStrategy }: Props = $props();
</script>

{i18nFormat($i18n.monitoring.auto_refill_strategy, [
	{
		placeholder: '{0}',
		value: formatTCycles(monitoringStrategy.BelowThreshold.min_cycles)
	},
	{
		placeholder: '{1}',
		value: formatTCycles(monitoringStrategy.BelowThreshold.fund_cycles)
	}
])}
