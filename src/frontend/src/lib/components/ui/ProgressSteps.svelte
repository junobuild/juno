<script lang="ts">
	import IconCheckCircle from '$lib/components/icons/IconCheckCircle.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		steps: [ProgressStep, ...ProgressStep[]];
	}

	let { steps }: Props = $props();
</script>

{#each steps as { step: _, text, state }, i}
	{@const last = i === steps.length - 1}
	<div class={`step ${state} ${last ? 'last' : ''}`}>
		<div class="step-indicator">
			{#if state === 'completed'}
				<IconCheckCircle />
			{:else if state === 'in_progress'}
				<div class="spinner">
					<span class="checkmark">{i + 1}</span>
					<Spinner />
				</div>
			{:else}
				<span class="checkmark round">{i + 1}</span>
			{/if}
		</div>

		<span class="text">{text}</span>

		<div class:line={!last} />

		{#if state === 'completed'}
			<span class="state">{$i18n.core.completed}</span>
		{:else if state === 'in_progress'}
			<div class="state">
				<span>{$i18n.core.in_progress}</span>
			</div>
		{/if}
	</div>
{/each}

<style lang="scss">
	.step {
		display: grid;
		grid-template-columns: max-content auto;
		grid-template-rows: repeat(2, auto);

		align-items: center;

		column-gap: var(--padding-2x);
		row-gap: var(--padding);

		padding: 0 0 var(--padding);

		--icon-check-circle-background: var(--color-primary);
		--icon-check-circle-color: var(--color-primary-contrast);

		color: var(--text-color);
		transition: color var(--animation-time-normal) ease-out;
	}

	.line,
	.state {
		align-self: flex-start;
	}

	.in_progress,
	.next {
		.line {
			--line-color: var(--text-color);
		}
	}

	.in_progress {
		--icon-check-circle-background: var(--color-secondary);
		--icon-check-circle-color: var(--color-secondary-contrast);

		.state {
			color: var(--color-secondary);
			background: rgba(var(--color-secondary-rgb), 0.3);
		}

		.checkmark {
			--checkmark-color: var(--color-secondary);
		}
	}

	.next {
		color: var(--text-color);

		--icon-check-circle-background: transparent;
		--icon-check-circle-color: var(--text-color);
		--icon-check-circle-border-color: var(--text-color);
	}

	.state {
		display: inline-flex;
		gap: var(--padding-0_5x);

		font-size: var(--font-size-very-small);

		color: var(--color-primary);
		background: rgba(var(--color-primary-rgb), 0.3);

		width: fit-content;

		padding: var(--padding-0_5x) var(--padding);
		border-radius: var(--border-radius);

		div {
			position: relative;
		}
	}

	.line {
		height: calc(5 * var(--padding));
		--line-color: var(--color-primary);
		background: linear-gradient(var(--line-color), var(--line-color)) no-repeat center/1.5px 100%;
	}

	.checkmark {
		--checkmark-color: var(--text-color);
		font-size: var(--font-size-very-small);
	}

	.spinner {
		width: 24px;
		height: 24px;

		position: relative;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.round {
		width: 22px;
		height: 22px;

		border-radius: 50%;

		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid var(--checkmark-color);
	}

	.step-indicator {
		display: flex;
		justify-content: center;
		align-items: center;

		width: 28px;
		height: 28px;
	}
</style>
