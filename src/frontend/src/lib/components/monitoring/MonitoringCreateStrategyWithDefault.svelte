<script lang="ts">
	import MonitoringCreateStrategy from '$lib/components/monitoring/MonitoringCreateStrategy.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import {onMount} from "svelte";
	import {isNullish} from "@dfinity/utils";
	import type {CyclesMonitoringStrategy} from "$declarations/mission_control/mission_control.did";

	interface Props {
		minCycles: bigint | undefined;
		fundCycles: bigint | undefined;
		saveAsDefaultStrategy: boolean;
		defaultStrategy: CyclesMonitoringStrategy | undefined;
		strategy: 'modules' | 'mission-control';
		onback: () => void;
		oncontinue: () => void;
	}

	let {
		minCycles = $bindable(undefined),
		fundCycles = $bindable(undefined),
		saveAsDefaultStrategy = $bindable(false),
		defaultStrategy,
		strategy,
		oncontinue,
		onback
	}: Props = $props();

	onMount(() => {
		saveAsDefaultStrategy = isNullish(defaultStrategy);
	});
</script>

<MonitoringCreateStrategy bind:minCycles bind:fundCycles {strategy} {oncontinue} {onback}>
	<Checkbox>
		<label class="default-strategy">
			<input
				type="checkbox"
				checked={saveAsDefaultStrategy}
				onchange={() => (saveAsDefaultStrategy = !saveAsDefaultStrategy)}
			/>
			<span>{$i18n.monitoring.set_as_default_strategy}</span>
		</label>
	</Checkbox>
</MonitoringCreateStrategy>

<style lang="scss">
	.default-strategy {
		margin: var(--padding) 0 var(--padding-3x);
	}
</style>
