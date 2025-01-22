<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import Cockpit from '$lib/components/launchpad/Cockpit.svelte';
	import SatelliteNew from '$lib/components/satellites/SatelliteNew.svelte';
	import Satellites from '$lib/components/satellites/Satellites.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { satellitesStore } from '$lib/derived/satellites.derived';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { i18n } from '$lib/stores/i18n.store';
	import { onLayoutTitleIntersection } from '$lib/stores/layout-intersecting.store';

	let loading = $state(true);
	run(() => {
		(() => {
			if (nonNullish($satellitesStore)) {
				setTimeout(() => (loading = false), 500);
				return;
			}

			loading = true;
		})();
	});
</script>

{#if loading || ($satellitesStore?.length ?? 0n) === 0}
	{#if loading}
		<div class="spinner" out:fade>
			<Spinner inline />

			<p class="loading">{$i18n.satellites.loading_launchpad}</p>
		</div>
	{:else}
		<section use:onIntersection onjunoIntersecting={onLayoutTitleIntersection}>
			<SatelliteNew />
		</section>
	{/if}
{:else if ($satellitesStore?.length ?? 0) >= 1}
	<div in:fade use:onIntersection onjunoIntersecting={onLayoutTitleIntersection}>
		<section class="cockpit">
			<Cockpit />
		</section>

		<h1>
			{$i18n.satellites.title}
		</h1>

		<section>
			<Satellites />
		</section>
	</div>
{/if}

<style lang="scss">
	@use '../../../lib/styles/mixins/grid';
	@use '../../../lib/styles/mixins/media';

	section {
		@include grid.twelve-columns;

		padding: var(--padding-2x) 0;

		&:first-of-type {
			margin-top: var(--padding-4x);
		}

		&.cockpit {
			display: flex;
			justify-content: center;

			@include media.min-width(large) {
				@include grid.twelve-columns;
			}
		}
	}

	h1 {
		margin-top: var(--padding-8x);
	}

	section,
	h1,
	div {
		position: relative;
		z-index: var(--z-index);
	}

	.spinner {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--padding-2x);

		font-size: var(--font-size-very-small);
	}

	.loading {
		text-align: center;
	}
</style>
