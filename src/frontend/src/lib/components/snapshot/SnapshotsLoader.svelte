<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import { onMount, type Snippet } from 'svelte';
	import { loadSnapshots } from '$lib/services/snapshots.services';
	import { authStore } from '$lib/stores/auth.store';

	interface Props {
		canisterId: Principal;
		children: Snippet;
	}

	let { canisterId, children }: Props = $props();

	onMount(() => {
		loadSnapshots({
			canisterId,
			identity: $authStore.identity
		});
	});
</script>

{@render children()}
