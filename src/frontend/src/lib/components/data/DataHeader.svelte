<script generics="T" lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { getContext, type Snippet } from 'svelte';
	import DataActions from '$lib/components/data/DataActions.svelte';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';

	interface Props {
		children: Snippet;
		actions?: Snippet;
	}

	let { children, actions }: Props = $props();

	const { store }: DataContext<T> = getContext<DataContext<T>>(DATA_CONTEXT_KEY);
</script>

{#if nonNullish($store?.data)}
	<div class="actions">
		<span>{@render children()}</span>

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
