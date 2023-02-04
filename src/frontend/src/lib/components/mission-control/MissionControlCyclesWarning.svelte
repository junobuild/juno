<script lang="ts">
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterCyclesWarning from '$lib/components/canister/CanisterCyclesWarning.svelte';
	import type { Principal } from '@dfinity/principal';

	export let missionControlId: Principal;
</script>

<Canister canisterId={missionControlId} display={false} />

<CanisterCyclesWarning canisterId={missionControlId}>
	Your mission control center is running low on cycles.
</CanisterCyclesWarning>
