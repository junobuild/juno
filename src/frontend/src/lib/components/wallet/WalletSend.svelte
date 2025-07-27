<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import { MISSION_CONTROL_v0_0_12 } from '$lib/constants/version.constants';
	import { balance, balanceNotLoaded } from '$lib/derived/balance.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		onsend?: () => void;
	}

	let { onsend }: Props = $props();

	const openSend = () => {
		if ($balanceNotLoaded) {
			toasts.show({ text: $i18n.wallet.balance_not_loaded, level: 'info' });
			return;
		}

		if (isNullish($balance) || $balance <= 0n) {
			toasts.show({ text: $i18n.wallet.balance_zero, level: 'info' });
			return;
		}

		if (compare($missionControlVersion?.current ?? '0.0.0', MISSION_CONTROL_v0_0_12) <= 0) {
			toasts.warn($i18n.wallet.wallet_upgrade);
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'send_tokens'
			}
		});

		onsend?.();
	};
</script>

<button onclick={openSend}>{$i18n.wallet.send}</button>
