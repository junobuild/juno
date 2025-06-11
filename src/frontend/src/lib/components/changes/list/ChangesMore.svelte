<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import IconMore from '$lib/components/icons/IconMore.svelte';
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { reloadSatelliteProposals } from '$lib/services/proposals/proposals.list.satellite.services';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();

	let visible = $state(false);

	let button = $state<HTMLButtonElement | undefined>(undefined);

	const reload = async () => {
		visible = false;

		busy.start();

		await reloadSatelliteProposals({
			satelliteId,
			skipReload: false,
			identity: $authStore.identity
		});

		busy.stop();
	};
</script>

<button
	class="icon"
	aria-label={$i18n.core.more}
	type="button"
	onclick={() => (visible = true)}
	bind:this={button}><IconMore size="20px" /></button
>

<Popover bind:visible anchor={button} direction="ltr">
	<div class="container">
		<button class="menu" type="button" onclick={reload}><IconRefresh /> {$i18n.core.reload}</button>
	</div>
</Popover>

<style lang="scss">
	@use '../../../styles/mixins/overlay';

	@include overlay.popover-container;

	button.icon {
		padding: 0;
	}

	button.menu {
		text-align: left;
	}
</style>
