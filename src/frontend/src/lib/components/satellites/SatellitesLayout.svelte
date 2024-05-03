<script lang="ts">
	import IconList from '$lib/components/icons/IconList.svelte';
	import IconCards from '$lib/components/icons/IconCards.svelte';
	import { SatellitesLayout } from '$lib/types/layout';
	import { layoutSatellites } from '$lib/stores/layout.store';
</script>

<button
	class="primary"
	class:active={$layoutSatellites === SatellitesLayout.CARDS}
	on:click={() => layoutSatellites.select(SatellitesLayout.CARDS)}
>
	<IconCards />
</button>

<button
	class="primary"
	class:active={$layoutSatellites === SatellitesLayout.LIST}
	on:click={() => layoutSatellites.select(SatellitesLayout.LIST)}
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
