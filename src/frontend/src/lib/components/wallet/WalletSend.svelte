<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import { MISSION_CONTROL_v0_0_12 } from '$lib/constants/version.constants';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import {
		balanceNotLoaded,
		devCyclesBalance,
		missionControlIcpBalance
	} from '$lib/derived/wallet/balance.derived';
    import type {SelectedToken, SelectedWallet} from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		onsend?: () => void;
		selectedWallet: SelectedWallet;
        selectedToken: SelectedToken;
	}

	let { onsend, selectedWallet }: Props = $props();

	let walletMissionControl = $derived(selectedWallet.type === 'mission_control');

	let balance = $derived(walletMissionControl ? $missionControlIcpBalance : $devCyclesBalance);

	const openSend = () => {
		if ($balanceNotLoaded) {
			toasts.show({ text: $i18n.wallet.balance_not_loaded, level: 'info' });
			return;
		}

		if (isNullish(balance) || balance <= 0n) {
			toasts.show({ text: $i18n.wallet.balance_zero, level: 'info' });
			return;
		}

		if (
			walletMissionControl &&
			compare($missionControlVersion?.current ?? '0.0.0', MISSION_CONTROL_v0_0_12) <= 0
		) {
			toasts.warn($i18n.wallet.wallet_upgrade);
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'send_tokens',
				detail: {
					selectedWallet
				}
			}
		});

		onsend?.();
	};
</script>

<button onclick={openSend}>{$i18n.wallet.send}</button>
