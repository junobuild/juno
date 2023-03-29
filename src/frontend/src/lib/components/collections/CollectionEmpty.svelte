<script lang="ts">
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { listParamsFilteredStore } from '$lib/stores/data.store';

	export let collection: string | undefined;
</script>

<p class="empty">
	{#if $listParamsFilteredStore}
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
