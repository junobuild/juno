<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import SatelliteNewLaunchButton from '$lib/components/satellites/SatelliteNewLaunchButton.svelte';
	import LaunchpadSegments from '$lib/components/launchpad/LaunchpadSegments.svelte';
	import ContainerCentered from '$lib/components/ui/ContainerCentered.svelte';
	import Message from '$lib/components/ui/Message.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { satellitesStore } from '$lib/derived/satellites.derived';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { onLayoutTitleIntersection } from '$lib/stores/app/layout-intersecting.store';

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

	const customOnIntersection = (element: HTMLElement) =>
		onIntersection(element, {
			threshold: 0.8,
			rootMargin: '-50px 0px'
		});
</script>

{#if loading || ($satellitesStore?.length ?? 0n) === 0}
	{#if loading}
		<div class="spinner">
			<Message>
				{#snippet icon()}
					<Spinner inline />
				{/snippet}

				<p>{$i18n.launchpad.loading_launchpad}</p>
			</Message>
		</div>
	{:else}
		<div in:fade>
			<ContainerCentered>
				<SatelliteNewLaunchButton />
			</ContainerCentered>
		</div>
	{/if}
{:else if ($satellitesStore?.length ?? 0) >= 1}
	<section in:fade onjunoIntersecting={onLayoutTitleIntersection} use:customOnIntersection>
		<LaunchpadSegments />
	</section>
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
		transform: translate(-50%, -75%);
	}
</style>
