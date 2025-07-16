<script lang="ts">
	import IconFilter from '$lib/components/icons/IconFilter.svelte';
	import PopoverApply from '$lib/components/ui/PopoverApply.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { listParamsStore } from '$lib/stores/list-params.store';

	interface Props {
		matcherFilter?: boolean;
		ownerFilter?: boolean;
		direction?: 'rtl' | 'ltr';
		key?: { label: string; placeholder: string };
	}

	let { matcherFilter = true, ownerFilter = true, direction, key }: Props = $props();

	let matcher = $state($listParamsStore.filter.matcher ?? '');
	let owner = $state($listParamsStore.filter.owner ?? '');

	let visible: boolean = $state(false);

	// eslint-disable-next-line require-await
	const apply = async () => {
		listParamsStore.setFilter({
			matcher,
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
			matcher = $listParamsStore.filter.matcher ?? '';
			owner = $listParamsStore.filter.owner ?? '';
		}, 250);
	});
</script>

<PopoverApply ariaLabel={$i18n.filter.title} onapply={apply} bind:visible {direction}>
	{#snippet icon()}
		<IconFilter size="18px" />
	{/snippet}

	{#if matcherFilter}
		<label for="filter-keys">{key?.label ?? $i18n.filter.filter_keys}</label>

		<input
			bind:value={matcher}
			id="filter-keys"
			name="filter-keys"
			type="text"
			placeholder={key?.placeholder ?? $i18n.filter.placeholder_keys}
			autocomplete="off"
			data-1p-ignore
		/>
	{/if}

	{#if ownerFilter}
		<label for="filter-owner" class="owner">{$i18n.filter.filter_owner}</label>

		<input
			bind:value={owner}
			id="filter-owner"
			name="filter-owner"
			type="text"
			placeholder={$i18n.filter.placeholder_owners}
			autocomplete="off"
			data-1p-ignore
		/>
	{/if}
</PopoverApply>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.apply;
</style>
