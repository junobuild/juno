<script lang="ts">
	import type { SatelliteDid } from '$declarations';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';
	import { emit } from '$lib/utils/events.utils';
	import type { Option } from '$lib/types/utils';

	interface Props {
		satellite: Satellite;
		config?: Option<SatelliteDid.AuthenticationConfig>;
	}

	let { satellite, config = undefined }: Props = $props();

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

<button onclick={openAddCustomDomain}>{$i18n.hosting.add_custom_domain}</button>

<style lang="scss">
	button {
		margin: 0;
	}
</style>
