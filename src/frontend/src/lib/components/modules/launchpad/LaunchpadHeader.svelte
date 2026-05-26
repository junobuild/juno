<script lang="ts">
	import type { Snippet } from 'svelte';
	import LaunchpadGreetings from '$lib/components/modules/launchpad/LaunchpadGreetings.svelte';
	import { providerDataUi } from '$lib/derived/console/account.provider.derived';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { onLayoutTitleIntersection } from '$lib/stores/app/layout-intersecting.store';

	interface Props {
		children?: Snippet;
		filter?: string;
		withoutGreetingsReturningLabel?: boolean;
	}

	let { filter = $bindable(''), children, withoutGreetingsReturningLabel }: Props = $props();

	const customOnIntersection = (element: HTMLElement) =>
		onIntersection(element, {
			threshold: 0.8,
			rootMargin: '-50px 0px'
		});
</script>

<div class="header" onjunoIntersecting={onLayoutTitleIntersection} use:customOnIntersection>
	<LaunchpadGreetings
		providerData={$providerDataUi}
		withoutReturningLabel={withoutGreetingsReturningLabel}
	/>

	{@render children?.()}
</div>

<style lang="scss">
	@use '../../../styles/mixins/media';

	.header {
		grid-column: 1 / 13;

		@include media.min-width(medium) {
			grid-column: 1 / 12;
		}
	}
</style>
