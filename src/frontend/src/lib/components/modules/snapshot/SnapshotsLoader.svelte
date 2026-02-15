<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import { onMount, type Snippet } from 'svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { loadSnapshots } from '$lib/services/ic-mgmt/snapshots.services';

	interface Props {
		canisterId: Principal;
		children: Snippet;
	}

	let { canisterId, children }: Props = $props();

	onMount(() => {
		loadSnapshots({
			canisterId,
			identity: $authIdentity
		});
	});
</script>

{@render children()}
