<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import IconArrowDropDown from '$lib/components/icons/IconArrowDropDown.svelte';
	import SatelliteEnvironment from '$lib/components/satellites/SatelliteEnvironment.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { satelliteStore, satelliteUi } from '$lib/derived/satellite.derived';
	import { sortedSatelliteUis } from '$lib/derived/satellites.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { overviewLink } from '$lib/utils/nav.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);

	let label = $derived(
		nonNullish($satelliteStore)
			? satelliteName($satelliteStore)
			: $i18n.satellites.see_all_satellites
	);
</script>

{#snippet currentEnvironment()}
	{#if nonNullish($satelliteUi)}
		<SatelliteEnvironment satellite={$satelliteUi} />
	{/if}
{/snippet}

{#if $authSignedIn}
	<ButtonIcon onclick={() => (visible = true)} bind:button>
		{#snippet icon()}
			<IconArrowDropDown />
		{/snippet}

		{label}{@render currentEnvironment()}
	</ButtonIcon>
	<span class="satellite current"><span>{label}</span>{@render currentEnvironment()}</span>
{/if}

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

		@include media.min-width(large) {
			min-width: calc(40 * var(--padding));
		}
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

		span:first-of-type {
			max-width: 260px;

			@include text.truncate;

			@include media.min-width(medium) {
				max-width: 420px;
			}
		}
	}

	.current {
		display: none;

		@include media.min-width(small) {
			display: inline-flex;
		}
	}
</style>
