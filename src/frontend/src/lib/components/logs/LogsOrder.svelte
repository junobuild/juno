<script lang="ts">
	import { getContext } from 'svelte';
	import IconSort from '$lib/components/icons/IconSort.svelte';
	import PopoverApply from '$lib/components/ui/PopoverApply.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Log as LogType } from '$lib/types/log';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';

	interface Props {
		desc: boolean;
	}

	let { desc = $bindable() }: Props = $props();

	let visible: boolean = $state(false);

	const { list }: PaginationContext<LogType> =
		getContext<PaginationContext<LogType>>(PAGINATION_CONTEXT_KEY);

	const apply = async () => {
		await list();

		visible = false;
	};
</script>

<PopoverApply ariaLabel={$i18n.sort.title} direction="ltr" onapply={apply} bind:visible>
	{#snippet icon()}
		<IconSort size="20px" />
	{/snippet}

	<p class="category sort">{$i18n.functions.sort}</p>

	<label>
		<input name="desc" type="radio" value={false} bind:group={desc} />
		<span>{$i18n.sort.ascending}</span>
	</label>

	<label>
		<input name="desc" type="radio" value={true} bind:group={desc} />
		<span>{$i18n.sort.descending}</span>
	</label>
</PopoverApply>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.apply;
</style>
