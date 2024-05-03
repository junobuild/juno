<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store.js';
	import Input from '$lib/components/ui/Input.svelte';
	import { debounce } from '@dfinity/utils';

	export let filter = '';

	const updateFilter = () => (filter = filterInput);
	const debounceUpdateFilter = debounce(updateFilter);

	let filterInput = '';
	$: filterInput, debounceUpdateFilter();
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
</div>

<style lang="scss">
	@use '../../../lib/styles/mixins/media';

	[role='toolbar'] {
		grid-column: 1 / 13;
	}

	.input {
		@include media.min-width(medium) {
			max-width: media.$breakpoint-small;
		}
	}
</style>
