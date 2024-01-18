<script lang="ts">
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterWarnings from '$lib/components/canister/CanisterWarnings.svelte';
	import type { Principal } from '@dfinity/principal';

	export let canisterId: Principal;
</script>

<Canister {canisterId} segment="mission_control" display={false} />

<CanisterWarnings {canisterId}>
	<slot name="cycles" slot="cycles" />
	<slot name="heap" slot="heap" />
</CanisterWarnings>
