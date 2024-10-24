<script lang="ts" generics="T">
	import { nonNullish } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import DataActions from '$lib/components/data/DataActions.svelte';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';
	interface Props {
		children?: import('svelte').Snippet;
		actions?: import('svelte').Snippet;
	}

	let { children, actions }: Props = $props();

	// eslint-disable-next-line no-undef
	const { store }: DataContext<T> = getContext<DataContext<T>>(DATA_CONTEXT_KEY);
</script>

{#if nonNullish($store?.data)}
	<div class="actions" transition:fade>
		<span>{@render children?.()}</span>

		<DataActions>
			{@render actions?.()}
		</DataActions>
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/text';

	.actions {
		display: flex;
		justify-content: space-between;
		gap: var(--padding-2x);
	}

	span {
		@include text.truncate;
	}
</style>
