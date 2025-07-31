<script lang="ts">
	import IconSort from '$lib/components/icons/IconSort.svelte';
	import PopoverApply from '$lib/components/ui/PopoverApply.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { listParamsStore } from '$lib/stores/list-params.store';
	import type { ListOrderField } from '$lib/types/list';

	let desc = $state($listParamsStore.order.desc);
	let field: ListOrderField = $state($listParamsStore.order.field);

	let visible: boolean = $state(false);

	// eslint-disable-next-line require-await
	const apply = async () => {
		listParamsStore.setOrder({
			desc,
			field
		});

		visible = false;
	};

	$effect(() => {
		if (visible) {
			return;
		}

		// Avoid glitch
		setTimeout(() => {
			// eslint-disable-next-line prefer-destructuring
			desc = $listParamsStore.order.desc;
			// eslint-disable-next-line prefer-destructuring
			field = $listParamsStore.order.field;
		}, 250);
	});
</script>

<PopoverApply ariaLabel={$i18n.sort.title} onapply={apply} bind:visible>
	{#snippet icon()}
		<IconSort size="18px" />
	{/snippet}

	<p class="category">{$i18n.sort.sort_by_field}</p>

	<label>
		<input name="field" type="radio" value="keys" bind:group={field} />
		<span>{$i18n.sort.keys}</span>
	</label>

	<label>
		<input name="field" type="radio" value="created_at" bind:group={field} />
		<span>{$i18n.sort.created_at}</span>
	</label>

	<label>
		<input name="field" type="radio" value="updated_at" bind:group={field} />
		<span>{$i18n.sort.updated_at}</span>
	</label>

	<p class="category sort">{$i18n.sort.sort_results}</p>

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
