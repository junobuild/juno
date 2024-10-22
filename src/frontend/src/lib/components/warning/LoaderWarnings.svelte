<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterWarnings from '$lib/components/canister/CanisterWarnings.svelte';

	export let canisterId: Principal;
</script>

<Canister {canisterId} segment="mission_control" display={false} />

<CanisterWarnings {canisterId}>
	<slot name="cycles" slot="cycles" />
	<slot name="heap" slot="heap" />
</CanisterWarnings>
