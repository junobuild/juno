<script lang="ts">
	import CanisterJunoStatuses from '$lib/components/canister/CanisterJunoStatuses.svelte';
	import type { Principal } from '@dfinity/principal';

	export let missionControlId: Principal;
</script>

<CanisterJunoStatuses segment="mission_control" canisterId={missionControlId} />
