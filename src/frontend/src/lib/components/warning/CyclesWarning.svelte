<script lang="ts">
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterCyclesWarning from '$lib/components/canister/CanisterCyclesWarning.svelte';
	import type { Principal } from '@dfinity/principal';

	export let canisterId: Principal;
</script>

<Canister {canisterId} segment="mission_control" display={false} />

<CanisterCyclesWarning {canisterId}>
	<slot />
</CanisterCyclesWarning>
