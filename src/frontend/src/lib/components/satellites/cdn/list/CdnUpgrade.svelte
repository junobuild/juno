<script lang="ts">
	import type { SatelliteDid } from '$declarations';
	import IconArrowUpward from '$lib/components/icons/IconArrowUpward.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		asset: SatelliteDid.AssetNoContent;
		satellite: Satellite;
	}

	let { asset, satellite }: Props = $props();

	const openUpgrade = () => {
		emit({
			message: 'junoModal',
			detail: {
				type: 'upgrade_satellite_with_cdn',
				detail: { asset, satellite }
			}
		});
	};
</script>

<button class="square" aria-label={$i18n.canisters.upgrade} onclick={openUpgrade}
	><IconArrowUpward size="20px" /></button
>
