<script lang="ts">
	import Satellites from '$lib/components/satellites/Satellites.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { onLayoutTitleIntersection } from '$lib/stores/layout.store';
	import Cockpit from '$lib/components/launchpad/Cockpit.svelte';
</script>

<section use:onIntersection on:junoIntersecting={onLayoutTitleIntersection}>
	<Cockpit />
</section>

<h1>
	{$i18n.satellites.title}
</h1>

<section>
	<Satellites />
</section>

<style lang="scss">
	@use '../../../lib/styles/mixins/grid';

	section {
		@include grid.twelve-columns;

		padding: var(--padding-2x) 0;

		&:first-of-type {
			margin-top: var(--padding-4x);
		}
	}

	h1 {
		margin-top: var(--padding-8x);
	}
</style>
