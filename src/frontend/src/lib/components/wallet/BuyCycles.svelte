<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { busy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { emit } from '$lib/utils/events.utils';
	import { isTokenCycles } from '$lib/utils/token.utils';
	import { popupCenter } from '$lib/utils/window.utils';

	interface Props {
		selectedWallet: SelectedWallet;
		selectedToken: SelectedToken;
	}

	let { selectedWallet, selectedToken }: Props = $props();

	let interval = $state<NodeJS.Timeout | undefined>(undefined);

	const clear = () => clearInterval(interval);

	// eslint-disable-next-line require-await
	const buyCycles = async () => {
		busy.show();

		const walletIdText = encodeIcrcAccount(selectedWallet.walletId);

		const popup = window.open(
			`https://cycle.express/?to=${walletIdText}`,
			'cycle.express',
			popupCenter({ width: 576, height: 750 })
		);

		const reloadCycles = () => {
			if (popup?.closed === false) {
				return;
			}

			clear();

			emit({ message: 'junoRestartWallet' });

			busy.stop();
		};

		interval = setInterval(reloadCycles, 1000);
	};

	onDestroy(clear);

	const CYCLE_EXPRESS_URL = import.meta.env.VITE_CYCLE_EXPRESS_URL;
</script>

{#if notEmptyString(CYCLE_EXPRESS_URL) && isTokenCycles(selectedToken)}
	<button onclick={buyCycles} in:fade>{$i18n.canisters.buy_cycles}</button>
{/if}
