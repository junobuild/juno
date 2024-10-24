<script lang="ts">
	import { run, createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { CanisterIcStatus } from '$lib/types/canister';
	import type { Snippet } from 'svelte';

	interface Props {
		canister?: CanisterIcStatus | undefined;
		children?: Snippet;
	}

	let { canister = undefined, children }: Props = $props();

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
		<button class="menu" onclick={bubble('click')}>{@render children?.()}</button>
	</div>
{/if}
