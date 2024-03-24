<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { ListOrderField } from '$lib/types/list';
	import { listParamsStore } from '$lib/stores/data.store';
	import PopoverApply from '$lib/components/ui/PopoverApply.svelte';
	import IconSort from '$lib/components/icons/IconSort.svelte';

	let desc = $listParamsStore.order.desc;
	let field: ListOrderField = $listParamsStore.order.field;

	let visible: boolean | undefined;

	const apply = () => {
		listParamsStore.setOrder({
			desc,
			field
		});

		visible = false;
	};

	$: visible,
		(() => {
			if (visible) {
				return;
			}

			// Avoid glitch
			setTimeout(() => {
				desc = $listParamsStore.order.desc;
				field = $listParamsStore.order.field;
			}, 250);
		})();
</script>

<PopoverApply ariaLabel={$i18n.sort.title} on:click={apply} bind:visible>
	<IconSort size="20px" slot="icon" />

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
