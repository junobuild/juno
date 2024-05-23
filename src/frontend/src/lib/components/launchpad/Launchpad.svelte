<script lang="ts">
	import Satellites from '$lib/components/satellites/Satellites.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { onLayoutTitleIntersection } from '$lib/stores/layout.store';
	import Cockpit from '$lib/components/launchpad/Cockpit.svelte';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { satellitesStore } from '$lib/stores/satellite.store';
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import SatelliteNew from '$lib/components/satellites/SatelliteNew.svelte';
	import Illustration from '$lib/components/launchpad/Illustration.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	$: $missionControlStore,
		(async () => await loadSatellites({ missionControl: $missionControlStore }))();

	let loading = true;
	$: (() => {
		if (nonNullish($satellitesStore)) {
			setTimeout(() => (loading = false), 500);
			return;
		}

		loading = true;
	})();
</script>

{#if loading || ($satellitesStore?.length ?? 0n) === 0}
	{#if loading}
		<div class="spinner" out:fade>
			<Spinner />

			<p>{$i18n.satellites.loading_launchpad}</p>
		</div>
	{:else}
		<section use:onIntersection on:junoIntersecting={onLayoutTitleIntersection}>
			<SatelliteNew />
		</section>
	{/if}
{:else if ($satellitesStore?.length ?? 0) >= 1}
	<div in:fade use:onIntersection on:junoIntersecting={onLayoutTitleIntersection}>
		<section>
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

<Illustration />

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
	}
</style>
