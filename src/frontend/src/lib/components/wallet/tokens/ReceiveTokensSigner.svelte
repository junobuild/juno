<script lang="ts">
	import type { IcrcAccount } from '@dfinity/oisy-wallet-signer';
	import { IcrcWallet } from '@dfinity/oisy-wallet-signer/icrc-wallet';
	import { isNullish, nonNullish, toNullable } from '@dfinity/utils';
	import type { TransferParams } from '@icp-sdk/canisters/ledger/icrc';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import ReceiveTokensSignerForm from '$lib/components/wallet/tokens/ReceiveTokensSignerForm.svelte';
	import { OISY_WALLET_OPTIONS } from '$lib/constants/wallet.constants';
	import type { SelectedToken, WalletId } from '$lib/schemas/wallet.schema';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { assertAndConvertAmountToToken } from '$lib/utils/token.utils';

	interface Props {
		walletId: WalletId;
		selectedToken: SelectedToken;
		back: () => void;
		visible?: boolean;
	}

	let { back, walletId, selectedToken, visible = $bindable() }: Props = $props();

	let step: 'connecting' | 'receiving' | 'form' | 'success' = $state('connecting');
	let account: IcrcAccount | undefined = $state(undefined);

	const init = async () => {
		let wallet: IcrcWallet | undefined;

		try {
			wallet = await IcrcWallet.connect({
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
		const { valid, tokenAmount } = assertAndConvertAmountToToken({
			amount,
			balance,
			token: selectedToken.token,
			fee: selectedToken.fees.transaction
		});

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

		let wallet: IcrcWallet | undefined;

		try {
			wallet = await IcrcWallet.connect(OISY_WALLET_OPTIONS);

			const { owner, subaccount } = walletId;

			const params: TransferParams = {
				to: {
					owner,
					subaccount: toNullable(subaccount)
				},
				amount: tokenAmount.toUlps()
			};

			await wallet.transfer({
				owner: account.owner,
				params,
				ledgerCanisterId: selectedToken.ledgerId
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
		<p>{$i18n.wallet.on_its_way}</p>
		<button onclick={() => (visible = false)}>{$i18n.core.close}</button>
	</div>
{:else if step === 'form' && nonNullish(account)}
	<ReceiveTokensSignerForm {account} {back} receive={onsubmit} {selectedToken} />
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
