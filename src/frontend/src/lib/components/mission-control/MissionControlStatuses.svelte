<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import CanisterJunoStatuses from '$lib/components/canister/CanisterJunoStatuses.svelte';

	export let missionControlId: Principal;
</script>

<CanisterJunoStatuses segment="mission_control" canisterId={missionControlId} />
