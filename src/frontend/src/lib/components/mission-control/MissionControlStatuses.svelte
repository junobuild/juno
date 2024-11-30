<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import CanisterJunoStatuses from '$lib/components/canister/CanisterJunoStatuses.svelte';

	interface Props {
		missionControlId: Principal;
	}

	let { missionControlId }: Props = $props();
</script>

<CanisterJunoStatuses segment="mission_control" canisterId={missionControlId} />
