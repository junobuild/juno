<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import MonitoringStepBackContinue from '$lib/components/monitoring/MonitoringStepBackContinue.svelte';

	interface Props {
		onback: () => void;
		oncontinue: () => void;
	}

	let { oncontinue, onback }: Props = $props();

	let action = $state('generate');
</script>

<MonitoringStepBackContinue {onback} {oncontinue} grid={false}>
	{#snippet header()}
		<h2>{$i18n.monitoring.select_auto_refill_strategy}</h2>

		<p>
			{$i18n.monitoring.choose_method}
		</p>
	{/snippet}

	<div class="options">
		<label class="radio-group">
			<input type="radio" bind:group={action} name="action" value="generate" />
			<span class="text">
				<span>{$i18n.monitoring.suggested}</span>
				<span class="description">{$i18n.monitoring.suggested_description}</span>
			</span>
		</label>

		<label class="radio-group">
			<input type="radio" bind:group={action} name="action" value="add" />
			<span class="text">
				<span>{$i18n.monitoring.default}</span>
				<span class="description">{$i18n.monitoring.default_description}</span>
			</span>
		</label>

		<label class="radio-group">
			<input type="radio" bind:group={action} name="action" value="add" />
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
