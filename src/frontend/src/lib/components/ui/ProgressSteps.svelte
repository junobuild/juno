<script lang="ts">
	import IconCheckCircle from '$lib/components/icons/IconCheckCircle.svelte';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProgressStep } from '$lib/types/progress-step';

	interface Props {
		steps: [ProgressStep, ...ProgressStep[]];
	}

	let { steps }: Props = $props();
</script>

{#each steps as { step, text, state }, i (step)}
	{@const last = i === steps.length - 1}
	<div class={`step ${state} ${last ? 'last' : ''}`}>
		<div class="step-indicator">
			{#if state === 'completed'}
				<IconCheckCircle />
			{:else if state === 'error'}
				<span class="checkmark round"><IconClose /></span>
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

		<div class:line={!last}></div>

		{#if state === 'completed'}
			<span class="state">{$i18n.core.completed}</span>
		{:else if state === 'error'}
			<span class="state">{$i18n.core.error}</span>
		{:else if state === 'in_progress'}
			<span class="state">{$i18n.core.in_progress}</span>
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

	.error {
		.line {
			--line-color: var(--color-error);
		}
	}

	.in_progress {
		.state {
			color: var(--color-secondary-contrast);
			background: rgba(var(--color-secondary-rgb), 0.6);
			border: 1px solid var(--color-secondary);
		}
	}

	.error {
		.state {
			color: var(--color-error-contrast);
			background: rgba(var(--color-error-rgb), 0.6);
			border: 1px solid var(--color-error);
		}

		.checkmark {
			--checkmark-color: var(--color-error);
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

		color: var(--color-primary-contrast);
		background: rgba(var(--color-primary-rgb), 0.6);
		border: 1px solid var(--color-primary);

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
		color: var(--checkmark-color);
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
