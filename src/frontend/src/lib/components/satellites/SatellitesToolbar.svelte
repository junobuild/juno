<script lang="ts">
	import { run } from 'svelte/legacy';

	import { debounce } from '@dfinity/utils';
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
		filterInput, debounceUpdateFilter();
	});
</script>

<div role="toolbar">
	<div class="input">
		<Input
			name="filter"
			inputType="text"
			bind:value={filterInput}
			placeholder={$i18n.satellites.search}
			spellcheck={false}
		/>
	</div>

	<SatellitesLayout />
</div>

<style lang="scss">
	@use '../../../lib/styles/mixins/media';

	[role='toolbar'] {
		grid-column: 1 / 13;

		display: flex;
		align-items: flex-start;
		gap: var(--padding-2x);
	}

	.input {
		flex: 1;

		@include media.min-width(medium) {
			max-width: media.$breakpoint-medium;
		}
	}
</style>
