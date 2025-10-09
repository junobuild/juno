<script lang="ts">
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import SatelliteEnvironment from '$lib/components/satellites/SatelliteEnvironment.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { satelliteStore, satelliteUi } from '$lib/derived/satellite.derived';
	import { sortedSatelliteUis } from '$lib/derived/satellites.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { overviewLink } from '$lib/utils/nav.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { layoutTitle } from '$lib/derived/layout-title.derived';
	import IconUnfoldMore from '$lib/components/icons/IconUnfoldMore.svelte';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);

	let label = $derived(nonNullish($satelliteStore) ? satelliteName($satelliteStore) : undefined);

	let subNavigation = $derived(
		notEmptyString($layoutTitle) && $layoutTitle !== label ? $layoutTitle : undefined
	);

	let Icon = $derived($layoutNavigation?.data.icon);
</script>

<ButtonIcon onclick={() => (visible = true)} bind:button>
	{#snippet icon()}
		<IconUnfoldMore />
	{/snippet}

	{$i18n.satellites.see_all_satellites}
</ButtonIcon>

<Popover anchor={button} bind:visible>
	<div class="container">
		<a
			class="menu"
			aria-haspopup="menu"
			aria-label={$i18n.satellites.go_launchpad}
			href="/"
			rel="external noopener norefferer"
			role="menuitem"
		>
			<span>{$i18n.satellites.see_all_satellites}</span>
		</a>

		<hr />

		<div class="satellites">
			{#each $sortedSatelliteUis as satellite (satellite.satellite_id.toText())}
				{@const satName = satellite.metadata.name}

				<a
					class="menu"
					aria-haspopup="menu"
					aria-label={`To satellite ${satName}`}
					href={overviewLink(satellite.satellite_id)}
					rel="external noopener norefferer"
					role="menuitem"
				>
					<span class="satellite"><span>{satName}</span><SatelliteEnvironment {satellite} /></span>
				</a>
			{/each}
		</div>
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/media';

	.container {
		max-height: calc(30 * var(--padding));
		min-height: calc(30 * var(--padding));

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
		font-size: var(--font-size-small);
		max-width: 100%;
		@include text.truncate;
	}

	.satellites {
		position: relative;
		width: 100%;
	}

	a.menu {
		display: block;
		margin-bottom: var(--padding-0_5x);
	}

	.satellite {
		display: inline-flex;
		align-items: center;
		gap: var(--padding);
	}
</style>
