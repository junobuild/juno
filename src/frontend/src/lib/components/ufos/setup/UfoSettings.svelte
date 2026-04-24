<script lang="ts">
	import CanisterSettings from '$lib/components/modules/canister/settings/CanisterSettings.svelte';
	import Snapshots from '$lib/components/modules/snapshot/Snapshots.svelte';
	import SatelliteAccessKeys from '$lib/components/satellites/setup/SatelliteAccessKeys.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';
	import type { Ufo } from '$lib/types/ufo';

	interface Props {
		ufo: Ufo;
	}

	let { ufo }: Props = $props();
</script>

<CanisterSettings canisterId={ufo.ufo_id} segment="ufo" segmentLabel={$i18n.ufo.title} />

<Snapshots canisterId={ufo.ufo_id} segment="ufo" segmentLabel={$i18n.ufo.title} />
