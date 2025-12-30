<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import { i18n } from '$lib/stores/app/i18n.store';
	import {formatToken} from "$lib/utils/token.utils";
	import type {SelectedToken} from "$lib/schemas/wallet.schema";

	interface Props {
		balance: bigint | undefined;
		onmax: (max: string) => void;
		fee?: bigint;
		selectedToken: SelectedToken;
	}

	let { onmax, balance, fee, selectedToken }: Props = $props();

	const calculateMax = ($event: MouseEvent | TouchEvent) => {
		$event.preventDefault();

		if (isNullish(balance) || balance <= 0n) {
			// No error message as we prevent this to happen with the UI.
			return;
		}

		const appliedFee = fee ?? selectedToken.fee;
		const amount = balance - appliedFee;

		onmax(formatToken({selectedToken, amount}));
	};
</script>

{#if nonNullish(balance) && balance > 0n}
	<button class="article" onclick={calculateMax} tabindex="-1" in:fade>
		{$i18n.core.max}
	</button>
{/if}

<style lang="scss">
	button.article {
		background: rgba(var(--color-card-rgb), 0.9);

		box-shadow: none;
		border: none;

		padding: var(--padding-0_5x) var(--padding);
		margin: 0;
	}
</style>
