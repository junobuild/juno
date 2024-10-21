<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
	import { i18n } from '$lib/stores/i18n.store';
	import { emit } from '$lib/utils/events.utils';

	export let satellite: Satellite;
	export let config: AuthenticationConfig | undefined = undefined;

	const openAddCustomDomain = () => {
		emit({
			message: 'junoModal',
			detail: {
				type: 'add_custom_domain',
				detail: { satellite, config }
			}
		});
	};
</script>

<button on:click={openAddCustomDomain}>{$i18n.hosting.add_custom_domain}</button>

<style lang="scss">
	button {
		margin: 0;
	}
</style>
