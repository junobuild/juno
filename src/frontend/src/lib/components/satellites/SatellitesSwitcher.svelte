<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import IconArrowDropDown from '$lib/components/icons/IconArrowDropDown.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { sortedSatellites } from '$lib/derived/satellites.derived';
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

{#if $authSignedIn}
	<ButtonIcon onclick={() => (visible = true)} bind:button>
		{#snippet icon()}
			<IconArrowDropDown />
		{/snippet}

		{label}
	</ButtonIcon> <span>{label}</span>
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
			{#each $sortedSatellites as satellite (satellite.satellite_id.toText())}
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
		margin-bottom: var(--padding-0_5x);
	}
</style>
