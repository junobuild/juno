<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { fade, blur } from 'svelte/transition';
	import IconSync from '$lib/components/icons/IconSync.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData, CanisterStatus, CanisterSyncStatus } from '$lib/types/canister';

	interface Props {
		data?: CanisterData | undefined;
		sync?: CanisterSyncStatus | undefined;
	}

	let { data = undefined, sync }: Props = $props();

	let warning: boolean = $derived(data?.warning?.cycles === true);

	let status: CanisterStatus | undefined = $derived(data?.canister?.status);
</script>

{#if isNullish(status)}
	<div in:fade></div>
{:else if sync === 'syncing'}
	<span class="spinner" in:blur><IconSync size="16px" /> </span>
{:else if warning || status === 'stopping'}
	<div class="warning" in:fade aria-label={$i18n.canisters.warning_indicator}></div>
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

	.spinner {
		height: 16px;
	}
</style>
