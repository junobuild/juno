<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { emit } from '$lib/utils/events.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { busy } from '$lib/stores/busy.store';
	import { getAuthConfig } from '$lib/services/hosting.services';
	import { authSignedInStore, authStore } from '$lib/stores/auth.store';

	export let satellite: Satellite;

	const openAddCustomDomain = async () => {
		busy.start();

		const { success, config } = await getAuthConfig({
			identity: $authStore.identity,
			satelliteId: satellite.satellite_id
		});

		busy.stop();

		if (!success) {
			return;
		}

		emit({ message: 'junoModal', detail: { type: 'add_custom_domain', detail: { satellite, config } } });
	};
</script>

<button on:click={openAddCustomDomain}>{$i18n.hosting.add_custom_domain}</button>

<style lang="scss">
	button {
		margin: var(--padding-2x) 0 0;
	}
</style>
