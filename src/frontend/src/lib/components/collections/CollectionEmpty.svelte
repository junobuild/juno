<script lang="ts">
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { listParamsFilteredStore } from '$lib/stores/data.store';
	import type { Rule } from '$declarations/satellite/satellite.did';
	import { nonNullish } from '@dfinity/utils';

	export let rule: Rule | undefined;
	export let collection: string | undefined;

	let privateReadRule = false;
	$: privateReadRule = nonNullish(rule) && 'Private' in rule.read;
</script>

<p class="empty">
	{#if privateReadRule}
		{@html i18nFormat($i18n.collections.empty_private, [
			{
				placeholder: '{0}',
				value: collection ?? ''
			}
		])}
	{:else if $listParamsFilteredStore}
		<slot name="filter" />
	{:else}
		{@html i18nFormat($i18n.collections.empty, [
			{
				placeholder: '{0}',
				value: collection ?? ''
			}
		])}
	{/if}
</p>

<style lang="scss">
	.empty {
		margin: var(--padding-2x) var(--padding-3x);
	}
</style>
