<script lang="ts">
	import { initWalletWorker } from '$lib/services/worker.wallet.services';
	import type { PostMessageDataResponse } from '$lib/types/post-message';
	import type { TransactionWithId } from '@dfinity/ledger-icp';
	import { isNullish, jsonReviver } from '@dfinity/utils';
	import type { WalletWorker } from '$lib/services/worker.wallet.services';
	import type { Principal } from '@dfinity/principal';
	import { onDestroy, onMount } from 'svelte';

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
	};

	const initWorker = async () => {
		worker = await initWalletWorker();
	};

	$: worker,
		missionControlId,
		(async () => {
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
