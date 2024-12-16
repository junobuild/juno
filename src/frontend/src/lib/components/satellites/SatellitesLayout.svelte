<script lang="ts">
	import IconCards from '$lib/components/icons/IconCards.svelte';
	import IconList from '$lib/components/icons/IconList.svelte';
	import { layoutSatellites } from '$lib/stores/layout-launchpad.store';
	import { SatellitesLayout } from '$lib/types/layout';
</script>

<button
	class="primary"
	class:active={$layoutSatellites === SatellitesLayout.CARDS}
	onclick={() => layoutSatellites.select(SatellitesLayout.CARDS)}
>
	<IconCards />
</button>

<button
	class="primary"
	class:active={$layoutSatellites === SatellitesLayout.LIST}
	onclick={() => layoutSatellites.select(SatellitesLayout.LIST)}
>
	<IconList />
</button>

<style lang="scss">
	button {
		margin: var(--padding) 0 0;
	}

	.active {
		background: var(--color-primary-opaque);
		color: var(--color-primary-opaque-contrast);
	}
</style>
