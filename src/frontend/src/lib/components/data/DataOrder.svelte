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
		<input type="radio" bind:group={field} name="field" value="keys" />
		<span>{$i18n.sort.keys}</span>
	</label>

	<label>
		<input type="radio" bind:group={field} name="field" value="created_at" />
		<span>{$i18n.sort.created_at}</span>
	</label>

	<label>
		<input type="radio" bind:group={field} name="field" value="updated_at" />
		<span>{$i18n.sort.updated_at}</span>
	</label>

	<p class="category sort">{$i18n.sort.sort_results}</p>

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
