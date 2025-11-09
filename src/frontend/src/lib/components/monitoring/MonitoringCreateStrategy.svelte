<script lang="ts">
	import { type Snippet, untrack } from 'svelte';
	import MonitoringStepBackContinue from '$lib/components/monitoring/MonitoringStepBackContinue.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { tCyclesToCycles } from '$lib/utils/cycles.utils';

	interface Props {
		minCycles: bigint | undefined;
		fundCycles: bigint | undefined;
		strategy: 'modules' | 'mission-control';
		children?: Snippet;
		onback: () => void;
		oncontinue: () => void;
	}

	let {
		minCycles = $bindable(undefined),
		fundCycles = $bindable(undefined),
		strategy,
		children,
		oncontinue,
		onback
	}: Props = $props();

	let minTCycles: string = $state('');
	let fundTCycles: string = $state('');

	$effect(() => {
		const min = tCyclesToCycles(minTCycles);

		untrack(() => {
			minCycles = min;
		});
	});

	$effect(() => {
		const fund = tCyclesToCycles(fundTCycles);

		untrack(() => {
			fundCycles = fund;
		});
	});

	const disabled = $derived((minCycles ?? 0n) <= 0n || (fundCycles ?? 0n) <= 0n);
</script>

<MonitoringStepBackContinue {disabled} {onback} {oncontinue}>
	{#snippet header()}
		<h2>{$i18n.monitoring.configure_strategy}</h2>

		<p>
			{strategy === 'mission-control'
				? $i18n.monitoring.threshold_info_mission_control
				: $i18n.monitoring.threshold_info}
		</p>
	{/snippet}

	<div>
		<Value ref="min-t-cycles">
			{#snippet label()}
				{$i18n.monitoring.remaining_threshold}
			{/snippet}

			<Input
				name="cycles"
				inputType="icp"
				placeholder={$i18n.canisters.amount_cycles}
				required
				bind:value={minTCycles}
			/>
		</Value>
	</div>

	<div>
		<Value ref="fund-cycles">
			{#snippet label()}
				{$i18n.monitoring.top_up_amount}
			{/snippet}

			<Input
				name="cycles"
				inputType="icp"
				placeholder={$i18n.canisters.amount_cycles}
				required
				bind:value={fundTCycles}
			/>
		</Value>
	</div>

	{@render children?.()}
</MonitoringStepBackContinue>
