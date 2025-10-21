<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { getContext, type Snippet } from 'svelte';
	import { run } from 'svelte/legacy';
	import type { SatelliteDid } from '$declarations';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import {
		LIST_PARAMS_CONTEXT_KEY,
		type ListParamsContext,
		type ListParamsData
	} from '$lib/types/list-params.context';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		rule: SatelliteDid.Rule | undefined;
		collection: string | undefined;
		filter?: Snippet;
	}

	let { rule, collection, filter }: Props = $props();

	const { listParams } = getContext<ListParamsContext>(LIST_PARAMS_CONTEXT_KEY);

	const filterListParams = ({ filter: { matcher, owner } }: ListParamsData) =>
		(nonNullish(matcher) && matcher !== '') || (nonNullish(owner) && owner !== '');

	const listParamsFiltered = $derived(filterListParams($listParams));

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
	{:else if $listParamsFiltered}
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
