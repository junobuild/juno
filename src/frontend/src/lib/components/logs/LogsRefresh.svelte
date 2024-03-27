<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store.js';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import type { Log as LogType } from '$lib/types/log';
	import { getContext } from 'svelte';
	import IconAutoRenew from '$lib/components/icons/IconAutoRenew.svelte';

	const { list, resetPage }: PaginationContext<LogType> =
		getContext<PaginationContext<LogType>>(PAGINATION_CONTEXT_KEY);

	const reload = async () => {
		resetPage();
		await list();
	};
</script>

<button
	class="icon"
	aria-label={$i18n.core.refresh}
	type="button"
	on:click={async () => await reload()}><IconAutoRenew size="20px" /></button
>

<style lang="scss">
	button.icon {
		padding: 0;
	}
</style>
