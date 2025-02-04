<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import type { Rule } from '$declarations/satellite/satellite.did';
	import CollectionsNav from '$lib/components/collections/CollectionsNav.svelte';
	import NavSeparator from '$lib/components/ui/NavSeparator.svelte';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';

	interface Props {
		onclose: () => void;
		onedit: (rule: [string, Rule] | undefined) => void;
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
