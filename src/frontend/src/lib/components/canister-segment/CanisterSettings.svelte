<script lang="ts">
	import IcCanisterSettings from '$lib/components/canister/settings/CanisterSettings.svelte';
	import SatelliteAccessKeys from '$lib/components/satellites/setup/SatelliteAccessKeys.svelte';
	import Snapshots from '$lib/components/snapshot/Snapshots.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { SegmentCanister } from '$lib/types/segment';

	interface Props {
		canister: SegmentCanister;
	}

	let { canister }: Props = $props();

	// TODO: controller
</script>

<IcCanisterSettings
	canisterId={canister.canisterId}
	segment="canister"
	segmentLabel={$i18n.canister.title}
/>

<Snapshots
	canisterId={canister.canisterId}
	segment="canister"
	segmentLabel={$i18n.canister.title}
/>
