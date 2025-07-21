<script lang="ts">
	import type { Snippet } from 'svelte';
	import Actions from '$lib/components/core/Actions.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { nonNullish } from '@dfinity/utils';

	interface Props {
		visible?: boolean | undefined;
		mainActions?: Snippet;
		moreActions?: Snippet;
		cyclesActions?: Snippet;
		lifecycleActions?: Snippet;
	}

	let {
		visible = $bindable(false),
		lifecycleActions,
		moreActions,
		cyclesActions,
		mainActions
	}: Props = $props();
</script>

<div class="toolbar" role="toolbar">
	{@render mainActions?.()}

	<Actions bind:visible>
		{@render moreActions?.()}

		{#if nonNullish(cyclesActions)}
			<span>{$i18n.canisters.cycles}:</span>

			{@render cyclesActions()}
		{/if}

		{#if nonNullish(lifecycleActions)}
			<span>{$i18n.canisters.lifecycle}:</span>

			{@render lifecycleActions()}
		{/if}
	</Actions>
</div>

<style lang="scss">
	.toolbar {
		display: flex;
		align-items: center;
		gap: var(--padding-1_5x);

		margin: calc(-1 * var(--padding)) 0 var(--padding-8x);
	}

	span {
		font-size: var(--font-size-very-small);
		font-weight: var(--font-weight-bold);
		padding: var(--padding) var(--padding) var(--padding-0_5x);
		margin: 0;

		&:not(:first-of-type) {
			padding: var(--padding-3x) var(--padding) var(--padding-0_5x);
		}
	}
</style>
