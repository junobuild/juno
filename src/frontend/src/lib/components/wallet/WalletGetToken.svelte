<script lang="ts">
	import ConfettiSpread from '$lib/components/ui/ConfettiSpread.svelte';
	import { CYCLES_LEDGER_CANISTER_ID, ICP_LEDGER_CANISTER_ID } from '$lib/constants/app.constants';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { isDev } from '$lib/env/app.env';
	import { emulatorLedgerTransfer } from '$lib/rest/emulator.rest';
	import type { LedgerIdText, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { emit } from '$lib/utils/events.utils';
	import { testId } from '$lib/utils/test.utils';

	interface Props {
		selectedWallet: SelectedWallet;
	}

	let { selectedWallet }: Props = $props();

	let { walletId } = $derived(selectedWallet);

	let confetti = $state(false);

	const getCycles = async () => {
		await transferWithEmulator({
			ledgerId: CYCLES_LEDGER_CANISTER_ID,
			amount: 330_010_000_000_000n
		});
	};

	const getIcp = async () => {
		await transferWithEmulator({ ledgerId: ICP_LEDGER_CANISTER_ID, amount: 5_500_010_000n });
	};

	const transferWithEmulator = async ({
		ledgerId,
		amount
	}: {
		ledgerId: LedgerIdText;
		amount: bigint;
	}) => {
		try {
			await emulatorLedgerTransfer({ walletId, ledgerId, amount });

			emit({ message: 'junoRestartWallet' });
		} catch (err: unknown) {
			toasts.error({ text: $i18n.emulator.error_getting_icp, detail: err });
		} finally {
			confetti = true;

			setTimeout(() => (confetti = false), 5000);
		}
	};
</script>

{#if isDev()}
	{#if confetti}
		<ConfettiSpread />
	{/if}

	<button onclick={getCycles} {...testId(testIds.navbar.getCycles)}
		>{$i18n.emulator.get_cycles}</button
	>

	<button onclick={getIcp} {...testId(testIds.navbar.getIcp)}>{$i18n.emulator.get_icp}</button>
{/if}
