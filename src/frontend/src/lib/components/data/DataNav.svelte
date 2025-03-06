<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import CollectionsNav from '$lib/components/collections/CollectionsNav.svelte';
	import NavSeparator from '$lib/components/ui/NavSeparator.svelte';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';
	import type { CollectionRule } from '$lib/types/collection';

	interface Props {
		onclose: () => void;
		onedit: (rule: CollectionRule | undefined) => void;
	}

	let props: Props = $props();

	const { store }: DataContext<unknown> = getContext<DataContext<unknown>>(DATA_CONTEXT_KEY);
</script>

<CollectionsNav {...props}>
	{#if nonNullish($store) && nonNullish($store.key)}
		<NavSeparator visible={true} />

		<span>{$store.key}</span>
	{/if}
</CollectionsNav>

<style lang="scss">
	@use '../../styles/mixins/text';

	span {
		@include text.truncate;
	}
</style>
