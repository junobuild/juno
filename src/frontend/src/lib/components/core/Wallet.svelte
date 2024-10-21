<script lang="ts">
	import type { TransactionWithId } from '@dfinity/ledger-icp';
	import type { Principal } from '@dfinity/principal';
	import { isNullish, jsonReviver } from '@dfinity/utils';
	import { onDestroy, onMount } from 'svelte';
	import { type WalletWorker, initWalletWorker } from '$lib/services/worker.wallet.services';
	import type { PostMessageDataResponse } from '$lib/types/post-message';
	import { emit } from '$lib/utils/events.utils';

	export let missionControlId: Principal;
	export let balance: bigint | undefined = undefined;
	export let transactions: TransactionWithId[] = [];

	let worker: WalletWorker | undefined;

	const syncState = (data: PostMessageDataResponse) => {
		if (isNullish(data.wallet)) {
			return;
		}

		balance = data.wallet.balance;
		transactions = [...JSON.parse(data.wallet.newTransactions, jsonReviver), ...transactions];

		emit({
			message: 'junoSyncBalance',
			detail: balance
		});
	};

	const initWorker = async () => {
		worker = await initWalletWorker();
	};

	$: worker,
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

	onMount(async () => await initWorker());
	onDestroy(() => worker?.stop());
</script>

<slot />
