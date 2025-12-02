<script lang="ts">
	import { debounce } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import SatelliteNewButton from '$lib/components/satellites/SatelliteNewButton.svelte';
	import SatellitesLayout from '$lib/components/satellites/SatellitesLayout.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		filter?: string;
	}

	let { filter = $bindable('') }: Props = $props();

	const updateFilter = () => (filter = filterInput);
	const debounceUpdateFilter = debounce(updateFilter);

	let filterInput = $state('');
	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		(filterInput, debounceUpdateFilter());
	});
</script>

<div role="toolbar">
	<div class="filters">
		<div class="input">
			<Input
				name="filter"
				inputType="text"
				placeholder={$i18n.satellites.search}
				spellcheck={false}
				bind:value={filterInput}
			/>
		</div>

		<SatellitesLayout />
	</div>

	<SatelliteNewButton />
</div>

<style lang="scss">
	@use '../../../lib/styles/mixins/media';

	[role='toolbar'] {
		display: flex;
		flex-direction: column;
		column-gap: var(--padding-2x);

		grid-column: 1 / 13;

		@include media.min-width(medium) {
			flex-direction: row;

			grid-column: 1 / 12;
		}
	}

	.filters {
		display: flex;
		column-gap: var(--padding-2x);

		flex: 1;
	}

	.input {
		flex: 1;

		:global(input:not(:focus)) {
			box-shadow: 2px 2px var(--color-card-contrast);
		}

		@include media.min-width(medium) {
			max-width: media.$breakpoint-medium;
		}
	}
</style>
