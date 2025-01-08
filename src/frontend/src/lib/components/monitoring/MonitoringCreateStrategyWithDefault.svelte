<script lang="ts">
	import MonitoringCreateStrategy from '$lib/components/monitoring/MonitoringCreateStrategy.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		minCycles: bigint | undefined;
		fundCycles: bigint | undefined;
		saveAsDefaultStrategy: boolean;
		strategy: 'modules' | 'mission-control';
		onback: () => void;
		oncontinue: () => void;
	}

	let {
		minCycles = $bindable(undefined),
		fundCycles = $bindable(undefined),
		saveAsDefaultStrategy = $bindable(true),
		strategy,
		oncontinue,
		onback
	}: Props = $props();
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
