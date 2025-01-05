<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import { onMount, untrack } from 'svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import type { CyclesMonitoringStrategy } from '$declarations/mission_control/mission_control.did';

	interface Props {
		detail: JunoModalDetail;
		monitoringStrategy: CyclesMonitoringStrategy | undefined;
	}

	let { monitoringStrategy = $bindable(), detail }: Props = $props();

	let { monitoringConfig } = detail as JunoModalCreateSegmentDetail;

	let useDefaultStrategy = $state(false);
	let useMonitoringStrategy: CyclesMonitoringStrategy | undefined = $state(undefined);

	onMount(() => {
		useMonitoringStrategy = fromNullable(
			fromNullable(monitoringConfig?.cycles ?? [])?.default_strategy ?? []
		);
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
						type="checkbox"
						checked={useDefaultStrategy}
						onchange={() => (useDefaultStrategy = !useDefaultStrategy)}
					/>
					<span
						>{i18nFormat($i18n.monitoring.auto_refill_strategy, [
							{
								placeholder: '{0}',
								value: formatTCycles(monitoringStrategy.BelowThreshold.min_cycles)
							},
							{
								placeholder: '{1}',
								value: formatTCycles(monitoringStrategy.BelowThreshold.fund_cycles)
							}
						])}</span
					>
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
