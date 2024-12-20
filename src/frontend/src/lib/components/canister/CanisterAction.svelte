<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import type { CanisterSyncData } from '$lib/types/canister';

	interface Props {
		canister?: CanisterSyncData | undefined;
		children: Snippet;
		onclick: () => Promise<void>;
	}

	let { canister = undefined, children, onclick }: Props = $props();

	let enabled = $state(false);
	run(() => {
		enabled =
			nonNullish(canister) &&
			nonNullish(canister.data) &&
			nonNullish(canister.data.canister) &&
			canister.data.canister.status === 'running';
	});
</script>

{#if enabled}
	<div in:fade>
		<button class="menu" {onclick}>{@render children()}</button>
	</div>
{/if}
