<script lang="ts">
	import { nonNullish } from '@dfinity/utils';

	export let disabled: boolean | undefined = undefined;
	export let primary = false;
	export let row = false;

	let summary = nonNullish($$slots.summary);
</script>

<button class="article" on:click {disabled} class:primary class:row>
	{#if summary}
		<div class="summary">
			<slot name="summary" />
		</div>
	{/if}

	<div class="content" class:only={!summary}>
		<slot />
	</div>
</button>

<style lang="scss">
	button {
		height: 100%;
		min-height: 231px;
		margin: 0;

		&.primary {
			--color-card-contrast: var(--color-primary);
		}
	}

	.summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--padding-4x) var(--padding-4x) var(--padding);
	}

	.content {
		padding: var(--padding-2x) var(--padding-4x) var(--padding);
		min-height: 150px;
	}

	.content,
	.summary {
		width: 100%;

		:global(*::first-letter) {
			text-transform: uppercase;
		}
	}

	.only {
		height: 100%;
	}

	.row {
		grid-column: 1 / 13;
		min-height: auto;

		.content {
			padding: var(--padding-2x) var(--padding-4x);
			min-height: auto;
		}
	}
</style>
