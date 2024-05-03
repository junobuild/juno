<script lang="ts">
	import { nonNullish } from '@dfinity/utils';

	export let disabled: boolean | undefined = undefined;

	let summary = nonNullish($$slots.summary);
</script>

<button class="article" on:click {disabled}>
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
		:global(*::first-letter) {
			text-transform: uppercase;
		}

		width: 100%;
	}

	.only {
		height: 100%;
	}
</style>
