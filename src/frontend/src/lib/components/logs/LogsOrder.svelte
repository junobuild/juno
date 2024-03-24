<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import PopoverApply from '$lib/components/ui/PopoverApply.svelte';
	import IconSort from '$lib/components/icons/IconSort.svelte';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import type { Log as LogType } from '$lib/types/log';
	import { getContext } from 'svelte';

	export let desc: boolean;

	let visible: boolean | undefined;

	const { list }: PaginationContext<LogType> =
		getContext<PaginationContext<LogType>>(PAGINATION_CONTEXT_KEY);

	const apply = async () => {
		await list();

		visible = false;
	};
</script>

<PopoverApply ariaLabel={$i18n.sort.title} on:click={apply} bind:visible>
	<IconSort size="20px" slot="icon" />

	<p class="category sort">{$i18n.functions.sort}</p>

	<label>
		<input type="radio" bind:group={desc} name="desc" value={false} />
		<span>{$i18n.sort.ascending}</span>
	</label>

	<label>
		<input type="radio" bind:group={desc} name="desc" value={true} />
		<span>{$i18n.sort.descending}</span>
	</label>
</PopoverApply>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.apply;
</style>
