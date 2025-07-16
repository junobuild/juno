<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Snippet } from 'svelte';
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterWarnings from '$lib/components/canister/CanisterWarnings.svelte';

	interface Props {
		canisterId: Principal;
		cycles?: Snippet;
		heap?: Snippet;
	}

	let { canisterId, cycles, heap }: Props = $props();
</script>

<Canister {canisterId} display={false} />

<CanisterWarnings {canisterId} {cycles} {heap} />
