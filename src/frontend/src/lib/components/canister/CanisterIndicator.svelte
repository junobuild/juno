<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData, CanisterStatus } from '$lib/types/canister';

	interface Props {
		data?: CanisterData | undefined;
	}

	let { data = undefined }: Props = $props();

	let warning: boolean = $derived(data?.warning?.cycles === true);

	let status: CanisterStatus | undefined = $derived(data?.canister?.status);
</script>

{#if isNullish(status)}
	<div in:fade></div>
{:else if warning || status === 'stopping'}
	<div class="warning" aria-label={$i18n.canisters.warning_indicator} in:fade></div>
{:else if status === 'stopped'}
	<div class="stopped" in:fade></div>
{:else}
	<div class="running" in:fade></div>
{/if}

<style lang="scss">
	div {
		--indicator-size: var(--padding-2x);

		width: var(--indicator-size);
		min-width: var(--indicator-size);
		height: var(--indicator-size);

		margin: 0 0.12rem;

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
