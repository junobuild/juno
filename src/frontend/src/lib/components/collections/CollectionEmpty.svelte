<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import type { Rule } from '$declarations/satellite/satellite.did';
	import Html from '$lib/components/ui/Html.svelte';
	import { listParamsFilteredStore } from '$lib/stores/data.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import type { Snippet } from 'svelte';

	interface Props {
		rule: Rule | undefined;
		collection: string | undefined;
		filter?: Snippet;
	}

	let { rule, collection, filter }: Props = $props();

	let privateReadRule = $state(false);
	run(() => {
		privateReadRule = nonNullish(rule) && 'Private' in rule.read;
	});
</script>

<p class="empty">
	{#if privateReadRule}
		<Html
			text={i18nFormat($i18n.collections.empty_private, [
				{
					placeholder: '{0}',
					value: collection ?? ''
				}
			])}
		/>
	{:else if $listParamsFilteredStore}
		{@render filter?.()}
	{:else}
		<Html
			text={i18nFormat($i18n.collections.empty, [
				{
					placeholder: '{0}',
					value: collection ?? ''
				}
			])}
		/>
	{/if}
</p>

<style lang="scss">
	.empty {
		margin: var(--padding-2x) var(--padding-3x);
	}
</style>
