<script lang="ts">
	export let disabled: boolean | undefined = undefined;

	let summary = $$slots.summary !== undefined;
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
	@use '../../styles/mixins/shadow';

	button {
		height: 100%;
		margin: 0;

		&[disabled] {
			@include shadow.shadow;
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
		:global(*::first-letter) {
			text-transform: uppercase;
		}

		width: 100%;
	}

	.only {
		height: 100%;
	}
</style>
