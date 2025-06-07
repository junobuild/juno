<script lang="ts">
	import IconFilter from '$lib/components/icons/IconFilter.svelte';
	import PopoverApply from '$lib/components/ui/PopoverApply.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { listParamsStore } from '$lib/stores/list-params.store';

	let owner = $state($listParamsStore.filter.owner ?? '');

	let visible: boolean = $state(false);

	// eslint-disable-next-line require-await
	const apply = async () => {
		listParamsStore.setFilter({
			matcher: $listParamsStore.filter.matcher,
			owner
		});

		visible = false;
	};

	$effect(() => {
		if (visible) {
			return;
		}

		// Avoid glitch
		setTimeout(() => {
			owner = $listParamsStore.filter.owner ?? '';
		}, 250);
	});
</script>

<PopoverApply ariaLabel={$i18n.filter.title} onapply={apply} bind:visible>
	{#snippet icon()}
		<IconFilter size="18px" />
	{/snippet}

	<label for="filter-owner">{$i18n.users.identifier}</label>

	<input
		bind:value={owner}
		id="filter-owner"
		name="filter-owner"
		type="text"
		placeholder={$i18n.filter.placeholder_owners}
		autocomplete="off"
		data-1p-ignore
	/>
</PopoverApply>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.apply;
</style>
