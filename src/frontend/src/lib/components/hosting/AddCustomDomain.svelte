<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { i18n } from '$lib/stores/i18n.store';
	import { openAddCustomDomain as openAddCustomDomainServices } from '$lib/services/hosting.services';
	import { authStore } from '$lib/stores/auth.store';

	export let satellite: Satellite;

	const openAddCustomDomain = async () => {
		await openAddCustomDomainServices({
			identity: $authStore.identity,
			satellite
		});
	};
</script>

<button on:click={openAddCustomDomain}>{$i18n.hosting.add_custom_domain}</button>

<style lang="scss">
	button {
		margin: var(--padding-2x) 0 0;
	}
</style>
