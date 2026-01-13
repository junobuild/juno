<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import LaunchpadFirstSatellite from '$lib/components/launchpad/LaunchpadFirstSatellite.svelte';
	import LaunchpadSegments from '$lib/components/launchpad/LaunchpadSegments.svelte';
	import Message from '$lib/components/ui/Message.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { satellites } from '$lib/derived/satellites.derived';
	import { i18n } from '$lib/stores/app/i18n.store';

	let loading = $state(true);
	run(() => {
		(() => {
			if (nonNullish($satellites)) {
				setTimeout(() => (loading = false), 500);
				return;
			}

			loading = true;
		})();
	});
</script>

{#if loading || ($satellites?.length ?? 0n) === 0}
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
		<section in:fade>
			<LaunchpadFirstSatellite />
		</section>
	{/if}
{:else if ($satellites?.length ?? 0) >= 1}
	<section in:fade>
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
	}

	.spinner {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -75%);
	}
</style>
