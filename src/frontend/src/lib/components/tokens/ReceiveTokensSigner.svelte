<script lang="ts">
	import type { Icrc1TransferRequest } from '@dfinity/ledger-icp';
	import type { IcrcAccount } from '@dfinity/oisy-wallet-signer';
	import { IcpWallet } from '@dfinity/oisy-wallet-signer/icp-wallet';
	import { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish, toNullable } from '@dfinity/utils';
	import ReceiveTokensSignerForm from '$lib/components/tokens/ReceiveTokensSignerForm.svelte';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { OISY_WALLET_OPTIONS } from '$lib/constants/wallet.constants';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { assertAndConvertAmountToICPToken } from '$lib/utils/token.utils';

	interface Props {
		missionControlId: MissionControlId;
		back: () => void;
		visible?: boolean;
	}

	let { back, missionControlId, visible = $bindable() }: Props = $props();

	let step: 'connecting' | 'receiving' | 'form' | 'success' = $state('connecting');
	let account: IcrcAccount | undefined = $state(undefined);

	const init = async () => {
		let wallet: IcpWallet | undefined;

		try {
			wallet = await IcpWallet.connect({
				...OISY_WALLET_OPTIONS,
				onDisconnect: () => {
					if (nonNullish(account)) {
						return;
					}

					back();
				}
			});

			const { allPermissionsGranted } = await wallet.requestPermissionsNotGranted();

			if (!allPermissionsGranted) {
				return;
			}

			const accounts = await wallet.accounts();

			account = accounts?.[0];

			step = 'form';
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.wallet_no_account,
				detail: err
			});

			back();

			return;
		} finally {
			await wallet?.disconnect();
		}
	};

	$effect(() => {
		init();
	});

	const onsubmit = async ({ balance, amount }: { balance: bigint | undefined; amount: string }) => {
		const { valid, tokenAmount } = assertAndConvertAmountToICPToken({ amount, balance });

		if (!valid || isNullish(tokenAmount)) {
			return;
		}

		if (isNullish(account)) {
			toasts.error({
				text: $i18n.errors.wallet_missing_account
			});
			return;
		}

		wizardBusy.start();

		step = 'receiving';

		let wallet: IcpWallet | undefined;

		try {
			wallet = await IcpWallet.connect(OISY_WALLET_OPTIONS);

			const request: Icrc1TransferRequest = {
				to: {
					owner: missionControlId,
					subaccount: toNullable()
				},
				amount: tokenAmount.toE8s()
			};

			await wallet.icrc1Transfer({
				owner: account.owner,
				request
			});

			step = 'success';
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.wallet_receive_error,
				detail: err
			});

			step = 'form';
		} finally {
			await wallet?.disconnect();
		}

		wizardBusy.stop();
	};
</script>

{#if step === 'success'}
	<Confetti display="popover" />

	<div class="msg">
		<p>{$i18n.wallet.icp_on_its_way}</p>
		<button onclick={() => (visible = false)}>{$i18n.core.close}</button>
	</div>
{:else if step === 'form' && nonNullish(account)}
	<ReceiveTokensSignerForm {account} {back} receive={onsubmit} />
{:else}
	<div class="spinner">
		<Spinner inline />
		<p class="connecting">
			{#if step === 'connecting'}
				{$i18n.wallet.connecting_wallet}
			{:else}
				{$i18n.wallet.wallet_approve}
			{/if}
		</p>
	</div>
{/if}

<style lang="scss">
	.spinner {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		gap: var(--padding-2x);

		min-height: 200px;
	}

	.connecting {
		font-size: var(--font-size-small);
		text-align: center;
		max-width: 200px;
	}

	.msg {
		min-height: 100px;
	}
</style>
