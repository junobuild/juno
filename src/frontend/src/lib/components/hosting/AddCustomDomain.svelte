<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { SatelliteDid ,MissionControlDid } from '$lib/types/declarations';
		import { emit } from '$lib/utils/events.utils';

	interface Props {
		satellite: MissionControlDid.Satellite;
		config?: SatelliteDid.AuthenticationConfig | undefined;
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
