<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import IconArrowDropDown from '$lib/components/icons/IconArrowDropDown.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { sortedSatellites } from '$lib/derived/satellites.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { overviewLink } from '$lib/utils/nav.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);
</script>

{#if nonNullish($satelliteStore)}
	<button class="text" onclick={() => (visible = true)} bind:this={button}
		><span>{satelliteName($satelliteStore)}</span> <IconArrowDropDown /></button
	>
{/if}

<Popover bind:visible anchor={button}>
	<div class="container">
		<a
			aria-label={$i18n.satellites.go_launchpad}
			href="/"
			class="menu"
			role="menuitem"
			aria-haspopup="menu"
			rel="external noopener norefferer"
		>
			<span>{$i18n.satellites.see_all_satellites}</span>
		</a>

		<hr />

		<div class="satellites">
			{#each $sortedSatellites as satellite}
				{@const satName = satelliteName(satellite)}

				<a
					aria-label={`To satellite ${satName}`}
					href={overviewLink(satellite.satellite_id)}
					class="menu"
					role="menuitem"
					aria-haspopup="menu"
					rel="external noopener norefferer"
				>
					<span>{satName}</span>
				</a>
			{/each}
		</div>
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/media';

	.container {
		max-height: calc(24 * var(--padding));
		min-height: calc(24 * var(--padding));
		overflow-y: auto;
		width: 100%;
		padding: var(--padding-1_5x);

		font-size: var(--font-size-small);
	}

	button.text {
		text-decoration: none;

		display: none;

		margin: var(--padding) 0;

		font-size: var(--font-size-very-small);

		@include media.min-width(xsmall) {
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}

	span {
		max-width: 200px;
		@include text.truncate;
	}

	.satellites {
		position: relative;
		width: 100%;
	}

	a.menu {
		margin-bottom: var(--padding-0_5x);
	}
</style>
