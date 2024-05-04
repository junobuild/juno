<script lang="ts">
	import type { CanisterData, CanisterStatus } from '$lib/types/canister';
	import { isNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import { i18n } from '$lib/stores/i18n.store';

	export let data: CanisterData | undefined = undefined;

	let warning: boolean;
	$: warning = data?.warning?.cycles === true ?? false;

	let status: CanisterStatus | undefined;
	$: status = data?.canister?.status;
</script>

{#if isNullish(status)}
	<div in:fade />
{:else if warning || status === 'stopping'}
	<div class="warning" in:fade aria-label={$i18n.canisters.warning_indicator} />
{:else if status === 'stopped'}
	<div class="stopped" in:fade />
{:else}
	<div class="running" in:fade />
{/if}

<style lang="scss">
	div {
		width: var(--padding-2x);
		height: var(--padding-2x);

		border-radius: 50%;
	}

	.warning {
		background: var(--color-warning);
	}

	.running {
		background: var(--color-success);
	}

	.stopped {
		background: var(--color-error);
	}
</style>
