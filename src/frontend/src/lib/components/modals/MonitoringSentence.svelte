<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlDid } from '$lib/types/declarations';
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
