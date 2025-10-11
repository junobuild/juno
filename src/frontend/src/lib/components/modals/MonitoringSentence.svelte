<script lang="ts">
	import type { MissionControlDid } from '$declarations';
	import { i18n } from '$lib/stores/i18n.store';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		monitoringStrategy: MissionControlDid.CyclesMonitoringStrategy;
	}

	let { monitoringStrategy }: Props = $props();
</script>

{i18nFormat($i18n.monitoring.auto_refill_strategy, [
	{
		placeholder: '{0}',
		value: formatTCycles(monitoringStrategy.BelowThreshold.fund_cycles)
	}
])}
