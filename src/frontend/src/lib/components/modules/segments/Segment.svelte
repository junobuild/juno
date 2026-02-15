<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import type { Snippet } from 'svelte';

	interface Props {
		id: Principal;
		children: Snippet;
	}

	let { children, id }: Props = $props();
</script>

<span>{@render children()}</span> <span class="canister-id">({id.toText()})</span>

<style lang="scss">
	.canister-id {
		font-size: var(--font-size-ultra-small);
	}
</style>
