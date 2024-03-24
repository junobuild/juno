<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import IconFilter from '$lib/components/icons/IconFilter.svelte';
	import { listParamsStore } from '$lib/stores/data.store';
	import PopoverApply from '$lib/components/ui/PopoverApply.svelte';

	let matcher = $listParamsStore.filter.matcher ?? '';
	let owner = $listParamsStore.filter.owner ?? '';

	let button: HTMLButtonElement | undefined;
	let visible: boolean | undefined;

	const apply = () => {
		listParamsStore.setFilter({
			matcher,
			owner
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
				matcher = $listParamsStore.filter.matcher ?? '';
				owner = $listParamsStore.filter.owner ?? '';
			}, 250);
		})();
</script>

<PopoverApply ariaLabel={$i18n.filter.title} on:click={apply} bind:visible>
	<IconFilter size="20px" slot="icon" />

	<label for="filter-keys">{$i18n.filter.filter_keys}</label>

	<input
		bind:value={matcher}
		id="filter-keys"
		name="filter-keys"
		type="text"
		placeholder={$i18n.filter.placeholder_keys}
	/>

	<label for="filter-owner" class="owner">{$i18n.filter.filter_owner}</label>

	<input
		bind:value={owner}
		id="filter-owner"
		name="filter-owner"
		type="text"
		placeholder={$i18n.filter.placeholder_owners}
	/>
</PopoverApply>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.apply;
</style>
