<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { CyclesMonitoringStrategy } from '$declarations/mission_control/mission_control.did';
	import MonitoringStepBackContinue from '$lib/components/monitoring/MonitoringStepBackContinue.svelte';
	import { BASIC_STRATEGY } from '$lib/constants/monitoring.constants';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		defaultStrategy: CyclesMonitoringStrategy | undefined;
		onback: () => void;
		oncontinue: (strategy?: CyclesMonitoringStrategy) => void;
	}

	let { defaultStrategy, oncontinue, onback }: Props = $props();

	let strategy: 'basic' | 'default' | 'custom' = $state('basic');

	const onSelect = () => {
		switch (strategy) {
			case 'default':
				oncontinue(defaultStrategy);
				break;
			case 'basic':
				oncontinue(BASIC_STRATEGY);
				break;
			default:
				oncontinue();
		}
	};
</script>

<MonitoringStepBackContinue grid={false} {onback} oncontinue={onSelect}>
	{#snippet header()}
		<h2>{$i18n.monitoring.select_auto_refill_strategy}</h2>

		<p>
			{$i18n.monitoring.choose_method}
		</p>
	{/snippet}

	<div class="options">
		<label class="radio-group">
			<input name="strategy" type="radio" value="basic" bind:group={strategy} />
			<span class="text">
				<span>{$i18n.monitoring.basic}</span>
				<span class="description">{$i18n.monitoring.basic_description}</span>
			</span>
		</label>

		{#if nonNullish(defaultStrategy)}
			<label class="radio-group">
				<input name="strategy" type="radio" value="default" bind:group={strategy} />
				<span class="text">
					<span>{$i18n.monitoring.default}</span>
					<span class="description">{$i18n.monitoring.default_description}</span>
				</span>
			</label>
		{/if}

		<label class="radio-group">
			<input name="strategy" type="radio" value="custom" bind:group={strategy} />
			<span class="text">
				<span>{$i18n.monitoring.custom}</span>
				<span class="description">{$i18n.monitoring.custom_description}</span>
			</span>
		</label>
	</div>
</MonitoringStepBackContinue>

<style lang="scss">
	.options {
		margin: 0 0 var(--padding-2x);
	}

	.radio-group {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: flex-start;

		gap: var(--padding-2x);
	}

	.text {
		display: inline-flex;
		flex-direction: column;
		gap: var(--padding-0_5x);
		padding: 0 0 var(--padding-2x);
	}

	.description {
		font-size: var(--font-size-small);
		color: var(--value-color);
	}
</style>
