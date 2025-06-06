<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import CollectionSelection from '$lib/components/collections/CollectionSelection.svelte';
	import IconVisibility from '$lib/components/icons/IconVisibility.svelte';
	import IconVisibilityOff from '$lib/components/icons/IconVisibilityOff.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CollectionRule } from '$lib/types/collection';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { getLocalListRulesParams, setLocalStorageItem } from '$lib/utils/local-storage.utils';

	interface Props {
		onclose: () => void;
		includeSysCollections: boolean;
	}

	let { onclose, includeSysCollections = $bindable(false) }: Props = $props();

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	const selectionCollection = (rule: CollectionRule | undefined) => {
		onclose();
		store.update((data) => ({ ...data, rule }));
	};

	let filterParams = $state(getLocalListRulesParams());

	const setIncludeSysCollection = () => {
		includeSysCollections = filterParams.includeSystem;
	};

	onMount(setIncludeSysCollection);

	const toggleIncludeSysCollections = () => {
		filterParams = {
			...filterParams,
			includeSystem: !filterParams.includeSystem
		};

		setIncludeSysCollection();

		setLocalStorageItem({ key: 'list_rules_params', value: JSON.stringify(filterParams) });
	};
</script>

<CollectionSelection {includeSysCollections} onedit={selectionCollection}>
	{#snippet includeSysCollectionsAction()}
		<button class="menu" type="button" onclick={toggleIncludeSysCollections}>
			{#if includeSysCollections}
				<IconVisibilityOff size="20px" /> {$i18n.collections.hide_system_collections}
			{:else}
				<IconVisibility size="20px" /> {$i18n.collections.show_system_collections}
			{/if}</button
		>
	{/snippet}
</CollectionSelection>
