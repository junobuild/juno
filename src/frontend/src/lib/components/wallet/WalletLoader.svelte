<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, jsonReviver } from '@dfinity/utils';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { run } from 'svelte/legacy';
	import { type WalletWorker, initWalletWorker } from '$lib/services/worker.wallet.services';
	import { balanceStore } from '$lib/stores/balance.store';
	import type { IcTransactionUi } from '$lib/types/ic-transaction';
	import type { PostMessageDataResponseWallet } from '$lib/types/post-message';
	import type { CertifiedData } from '$lib/types/store';

	interface Props {
		missionControlId: Principal;
		transactions?: IcTransactionUi[];
		children?: Snippet;
	}

	let { missionControlId, transactions = $bindable([]), children }: Props = $props();

	let worker: WalletWorker | undefined = $state();

	const syncState = (data: PostMessageDataResponseWallet) => {
		if (isNullish(data.wallet)) {
			return;
		}

		balanceStore.set(data.wallet.balance);

		const newTransactions = JSON.parse(data.wallet.newTransactions, jsonReviver).map(
			({ data }: CertifiedData<IcTransactionUi>) => data
		) as IcTransactionUi[];

		transactions = [
			...newTransactions,
			...transactions.filter(({ id }) => !newTransactions.some(({ id: txId }) => txId === id))
		];
	};

	const initWorker = async () => {
		worker = await initWalletWorker();
	};

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		worker,
			missionControlId,
			(() => {
				if (isNullish(missionControlId)) {
					worker?.stop();
					return;
				}

				worker?.start({
					missionControlId,
					callback: syncState
				});
			})();
	});

	onMount(async () => await initWorker());
	onDestroy(() => worker?.stop());
</script>

{@render children?.()}
