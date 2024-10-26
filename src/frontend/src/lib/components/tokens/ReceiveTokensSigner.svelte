<script lang="ts">
	import { IcpWallet } from '@dfinity/oisy-wallet-signer/icp-wallet';
	import { DEV } from '$lib/constants/constants';
	import type { IcrcAccount } from '@dfinity/oisy-wallet-signer';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18n } from '$lib/stores/i18n.store';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import ReceiveTokensSignerForm from '$lib/components/tokens/ReceiveTokensSignerForm.svelte';
	import { isNullish, nonNullish, toNullable } from '@dfinity/utils';
	import { OISY_WALLET_OPTIONS } from '$lib/constants/wallet.constants';
	import { Principal } from '@dfinity/principal';
	import { assertAndConvertAmountToICPToken } from '$lib/utils/token.utils';
	import { wizardBusy } from '$lib/stores/busy.store';
	import type { Icrc1TransferRequest } from '@dfinity/ledger-icp';

	interface Props {
		missionControlId: Principal;
		back: () => void;
		visible?: boolean;
	}

	let { back, missionControlId, visible = $bindable() }: Props = $props();

	let steps: 'connecting' | 'receiving' | 'form' | 'success' = $state('connecting');
	let account: IcrcAccount | undefined;

	let wallet: IcpWallet | undefined;

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

			steps = 'form';
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

		wizardBusy.start();

		steps = 'receiving';

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

			steps = 'success';
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.wallet_receive_error,
				detail: err
			});

			steps = 'form';
		} finally {
			await wallet?.disconnect();
		}

		wizardBusy.stop();
	};
</script>

{#if steps === 'success'}
	<div class="msg">
		<p>{$i18n.wallet.icp_on_its_way}</p>
		<button onclick={() => (visible = false)}>{$i18n.core.close}</button>
	</div>
{:else if steps === 'form' && nonNullish(account)}
	<ReceiveTokensSignerForm {account} {back} receive={onsubmit} />
{:else}
	<div class="spinner">
		<Spinner inline />
		<p class="connecting">
			{#if steps === 'connecting'}
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
