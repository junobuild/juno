<script lang="ts">
	import { satellitesStore, satelliteStore } from '$lib/stores/satellite.store';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import IconArrowDropDown from '$lib/components/icons/IconArrowDropDown.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { loadSatellites } from '$lib/services/satellites.services';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { overviewLink } from '$lib/utils/nav.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18n } from '$lib/stores/i18n.store';

	let button: HTMLButtonElement | undefined;
	let visible: boolean | undefined;

	let loading = false;

	const load = async () => {
		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		loading = true;

		await loadSatellites({ missionControl: $missionControlStore });

		loading = false;
	};
</script>

{#if nonNullish($satelliteStore)}
	<button class="text" on:click={() => (visible = true)} bind:this={button}
		><span>{satelliteName($satelliteStore)}</span> <IconArrowDropDown /></button
	>
{/if}

<Popover bind:visible anchor={button} direction="rtl">
	<div class="container">
		<a
			aria-label="To the satellites"
			href="/"
			class="menu"
			role="menuitem"
			aria-haspopup="menu"
			rel="external noopener norefferer"
		>
			<span>See all satellites</span>
		</a>

		<hr />

		<div class="satellites" class:loading>
			{#if loading}
				<Spinner />
			{:else if nonNullish($satellitesStore)}
				{#each $satellitesStore as satellite}
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
			{/if}
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
		padding: var(--padding);
	}

	button.text {
		text-decoration: none;

		display: none;

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

	.loading {
		margin: 0 0 var(--padding-4x);
	}
</style>
