<script lang="ts">
	import CanisterSettings from '$lib/components/modules/canister/settings/CanisterSettings.svelte';
	import Snapshots from '$lib/components/modules/snapshot/Snapshots.svelte';
	import UfoAccessKeys from '$lib/components/ufos/setup/UfoAccessKeys.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Ufo } from '$lib/types/ufo';

	interface Props {
		ufo: Ufo;
	}

	let { ufo }: Props = $props();
</script>

<CanisterSettings canisterId={ufo.ufo_id} segment="ufo" segmentLabel={$i18n.ufo.title} />

<UfoAccessKeys {ufo} />

<Snapshots canisterId={ufo.ufo_id} segment="ufo" segmentLabel={$i18n.ufo.title} />
