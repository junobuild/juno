<script lang="ts">
	import { getContext } from 'svelte';
	import CollectionEdit from '$lib/components/collections/CollectionEdit.svelte';
	import CollectionSelection from '$lib/components/collections/CollectionSelection.svelte';
	import CollectionsNav from '$lib/components/collections/CollectionsNav.svelte';
	import IconNew from '$lib/components/icons/IconNew.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CollectionRule } from '$lib/types/collection';
	import type { SatelliteDid } from '$lib/types/declarations';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';

	interface Props {
		type: SatelliteDid.CollectionType;
	}

	let { type }: Props = $props();

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let editCollection = $state(false);

	const editCollectionRule = (rule: CollectionRule | undefined) => {
		store.update((data) => ({ ...data, rule }));
		editCollection = true;
	};

	const startCollectionRule = () => {
		store.update((data) => ({ ...data, rule: undefined }));
		editCollection = true;
	};

	export const closeEdit = () => {
		store.update((data) => ({ ...data, rule: undefined }));
		editCollection = false;
	};
</script>

<section>
	<CollectionsNav onclose={closeEdit} onedit={editCollectionRule} />

	<CollectionSelection onedit={editCollectionRule} onstart={startCollectionRule} start />

	<p class="title rules-title">{$i18n.collections.details}</p>

	<div class="rules">
		{#if editCollection}
			<CollectionEdit oncancel={closeEdit} onsuccess={closeEdit} {type} />
		{:else}
			<button class="text action start" onclick={startCollectionRule}
				><IconNew size="16px" /> <span>{$i18n.collections.start_collection}</span></button
			>
		{/if}
	</div>
</section>

<style lang="scss">
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/collections';

	section {
		@include collections.section;
	}

	.rules {
		grid-column: span 4;
		min-height: var(--padding-8x);

		@include media.min-width(large) {
			grid-column: span 3;
		}

		.action {
			display: flex;

			@include media.min-width(large) {
				display: none;
			}
		}
	}

	.action {
		@include collections.action;
	}

	.title {
		@include collections.title;
	}

	.rules-title {
		grid-column: span 4;

		@include media.min-width(large) {
			grid-column: span 3;
		}
	}

	.start {
		@include collections.start;
	}
</style>
