<script lang="ts">
	import {satelliteIdStore, satellitesStore, satelliteStore} from '$lib/stores/satellite.store';
	import { nonNullish } from '$lib/utils/utils';
	import IconArrowDropDown from '$lib/components/icons/IconArrowDropDown.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { navigateToAnalytics } from '$lib/utils/nav.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { Principal } from '@dfinity/principal';

	let button: HTMLButtonElement | undefined;
	let visible: boolean | undefined;

	const navigate = async (satelliteId?: Principal) => {
		await navigateToAnalytics(satelliteId);
		visible = false;
	}
</script>

<button class="text" on:click={() => (visible = true)} bind:this={button}
	><span>{nonNullish($satelliteStore) ? satelliteName($satelliteStore) : 'All satellites'}</span>
	<IconArrowDropDown /></button
>

<Popover bind:visible anchor={button}>
	<div class="container">
		<button class="menu" role="menuitem" aria-haspopup="menu" on:click={async () => await navigate()}>
			<span>All satellites</span>
		</button>

		{#if $satellitesStore?.length > 0}
			<hr />
		{/if}

		<div class="satellites">
			{#if nonNullish($satellitesStore)}
				{#each $satellitesStore as satellite}
					{@const satName = satelliteName(satellite)}

					<button
						on:click={async () => await navigate(satellite.satellite_id)}
						class="menu"
						role="menuitem"
						aria-haspopup="menu"
						rel="external noopener norefferer"
					>
						<span>{satName}</span>
					</button>
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
		padding: var(--padding-1_5x);
	}

	button.text {
		text-decoration: none;

		display: none;

		margin: var(--padding) 0;

		font-size: var(--font-size-small);

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
