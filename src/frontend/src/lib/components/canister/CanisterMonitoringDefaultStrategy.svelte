<script lang="ts">
	import { nonNullish, fromNullishNullable } from '@dfinity/utils';
	import { onMount, untrack } from 'svelte';
	import type { CyclesMonitoringStrategy } from '$declarations/mission_control/mission_control.did';
	import MonitoringSentence from '$lib/components/modals/MonitoringSentence.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { BASIC_STRATEGY } from '$lib/constants/monitoring.constants';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		monitoringStrategy: CyclesMonitoringStrategy | undefined;
	}

	let { monitoringStrategy = $bindable(), detail }: Props = $props();

	let { monitoringConfig, monitoringEnabled } = $derived(detail as JunoModalCreateSegmentDetail);

	let useDefaultStrategy = $state(false);
	let useMonitoringStrategy: CyclesMonitoringStrategy | undefined = $state(undefined);

	onMount(() => {
		// If user as a default strategy, we use this strategy else, if monitored is already enabled, we use the basic suggested strategy
		useMonitoringStrategy = monitoringEnabled
			? (fromNullishNullable(fromNullishNullable(monitoringConfig?.cycles)?.default_strategy) ??
				BASIC_STRATEGY)
			: undefined;

		monitoringStrategy = useMonitoringStrategy;
		useDefaultStrategy = nonNullish(monitoringStrategy);
	});

	$effect(() => {
		useDefaultStrategy;

		untrack(() => (monitoringStrategy = useDefaultStrategy ? useMonitoringStrategy : undefined));
	});
</script>

{#if nonNullish(useDefaultStrategy) && nonNullish(useMonitoringStrategy)}
	<div class="default-strategy">
		<Value>
			{#snippet label()}
				{$i18n.monitoring.auto_refill}
			{/snippet}

			<div class="group">
				<Checkbox>
					<input
						checked={useDefaultStrategy}
						onchange={() => (useDefaultStrategy = !useDefaultStrategy)}
						type="checkbox"
					/>
					<span><MonitoringSentence monitoringStrategy={useMonitoringStrategy} /></span>
				</Checkbox>
			</div>
		</Value>
	</div>
{/if}

<style lang="scss">
	.default-strategy {
		margin: var(--padding-0_5x) 0 0;
	}

	.group {
		padding: var(--padding) 0 0;
	}
</style>
