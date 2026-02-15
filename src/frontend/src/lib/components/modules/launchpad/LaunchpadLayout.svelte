<script lang="ts">
	import IconCards from '$lib/components/icons/IconCards.svelte';
	import IconList from '$lib/components/icons/IconList.svelte';
	import { layoutLaunchpad } from '$lib/stores/app/layout-launchpad.store';
	import { LaunchpadLayout } from '$lib/types/layout';
</script>

<button
	class="primary"
	class:active={$layoutLaunchpad === LaunchpadLayout.CARDS}
	onclick={() => layoutLaunchpad.select(LaunchpadLayout.CARDS)}
>
	<IconCards />
</button>

<button
	class="primary"
	class:active={$layoutLaunchpad === LaunchpadLayout.LIST}
	onclick={() => layoutLaunchpad.select(LaunchpadLayout.LIST)}
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
