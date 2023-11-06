<script lang="ts">
	import CollectionsNav from '$lib/components/collections/CollectionsNav.svelte';
	import { nonNullish } from '$lib/utils/utils';
	import NavSeparator from '$lib/components/ui/NavSeparator.svelte';
	import { getContext } from 'svelte';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';

	const { store }: DataContext<unknown> = getContext<DataContext<unknown>>(DATA_CONTEXT_KEY);
</script>

<CollectionsNav on:junoCollectionEdit on:junoCollectionClose>
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
