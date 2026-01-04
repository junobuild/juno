<script lang="ts">
	import { debounce } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import AttachActions from '$lib/components/attach-detach/AttachActions.svelte';
	import LaunchpadGreetings from '$lib/components/launchpad/LaunchpadGreetings.svelte';
	import LaunchpadNewActions from '$lib/components/launchpad/LaunchpadNewActions.svelte';
	import SatellitesLayout from '$lib/components/satellites/SatellitesLayout.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { onLayoutTitleIntersection } from '$lib/stores/app/layout-intersecting.store';

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

	const customOnIntersection = (element: HTMLElement) =>
			onIntersection(element, {
				threshold: 0.8,
				rootMargin: '-50px 0px'
			});
</script>

<div class="header" onjunoIntersecting={onLayoutTitleIntersection} use:customOnIntersection>
	<LaunchpadGreetings />

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

			<AttachActions />
		</div>

		<LaunchpadNewActions />
	</div>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.header {
		grid-column: 1 / 13;

		@include media.min-width(medium) {
			grid-column: 1 / 12;
		}
	}

	[role='toolbar'] {
		display: flex;
		flex-direction: column;
		column-gap: var(--padding-2x);

		@include media.min-width(medium) {
			flex-direction: row;
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
