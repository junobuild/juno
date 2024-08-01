<script lang="ts" generics="T">
	import DataActions from '$lib/components/data/DataActions.svelte';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';
	import { getContext } from 'svelte';
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';

	// eslint-disable-next-line no-undef
	const { store }: DataContext<T> = getContext<DataContext<T>>(DATA_CONTEXT_KEY);
</script>

{#if nonNullish($store?.data)}
	<div class="actions" transition:fade>
		<span><slot /></span>

		<DataActions>
			<slot name="actions" />
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
