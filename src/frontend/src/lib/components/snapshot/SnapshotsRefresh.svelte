<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import IconAutoRenew from '$lib/components/icons/IconAutoRenew.svelte';
	import { reloadSnapshots } from '$lib/services/snapshots.services';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		canisterId: Principal;
	}

	let { canisterId }: Props = $props();

	const reload = async () => {
		busy.start();

		await reloadSnapshots({
			canisterId,
			identity: $authStore.identity
		});

		busy.stop();
	};
</script>

<button class="icon" aria-label={$i18n.core.refresh} onclick={reload} type="button"
	><IconAutoRenew size="16px" />
</button>

<style lang="scss">
	button {
		width: fit-content;
		padding: 0;
	}
</style>
