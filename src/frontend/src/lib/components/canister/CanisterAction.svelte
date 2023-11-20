<script lang="ts">
	import type { Canister } from '$lib/types/canister';
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import { DEV_FEATURES } from '$lib/constants/constants';

	export let canister: Canister | undefined = undefined;

	let enabled = false;
	$: enabled =
		nonNullish(canister) && nonNullish(canister.data) && canister.data.status === 'running';
</script>

{#if enabled && DEV_FEATURES}
	<div in:fade>
		<button class="menu" on:click><slot /></button>
	</div>
{/if}
