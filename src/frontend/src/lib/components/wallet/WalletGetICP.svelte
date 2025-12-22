<script lang="ts">
	import ConfettiSpread from '$lib/components/ui/ConfettiSpread.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { isDev } from '$lib/env/app.env';
	import { emulatorLedgerTransfer } from '$lib/rest/emulator.rest';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
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

	const onClick = async () => {
		try {
			await emulatorLedgerTransfer({ walletId });

			emit({ message: 'junoRestartWallet' });

			confetti = true;

			setTimeout(() => (confetti = false), 5000);
		} catch (err: unknown) {
			toasts.error({ text: $i18n.emulator.error_getting_icp, detail: err });
		}
	};
</script>

{#if isDev()}
	{#if confetti}
		<ConfettiSpread />
	{/if}

	<button onclick={onClick} {...testId(testIds.navbar.getIcp)}>{$i18n.emulator.get_icp}</button>
{/if}
