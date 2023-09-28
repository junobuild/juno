<script lang="ts">
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import type { Principal } from '@dfinity/principal';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import QRCodeContainer from '$lib/components/ui/QRCodeContainer.svelte';
	import type { WalletWorker } from '$lib/services/worker.wallet.services';
	import { onDestroy, onMount } from 'svelte';
	import { initWalletWorker } from '$lib/services/worker.wallet.services';
	import type { PostMessageDataResponse } from '$lib/types/post-message';
	import { getAccountIdentifier } from '$lib/api/ledger.api';
	import { getCredits } from '$lib/api/console.api';
	import { toasts } from '$lib/stores/toasts.store';
	import type { TransactionWithId } from '@junobuild/ledger';
	import MissionControlTransactions from '$lib/components/mission-control/MissionControlTransactions.svelte';
	import { jsonReviver } from '@dfinity/utils';

	export let missionControlId: Principal;

	const accountIdentifier = getAccountIdentifier(missionControlId);
	let credits = 0n;

	/**
	 * Credits
	 */

	const loadCredits = async () => {
		try {
			credits = await getCredits();
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.load_credits,
				detail: err
			});
		}
	};

	/**
	 * Web Worker
	 */

	let worker: WalletWorker | undefined;

	let balance = 0n;
	let transactions: TransactionWithId[] = [];

	const syncState = (data: PostMessageDataResponse) => {
		if (isNullish(data.wallet)) {
			return;
		}

		balance = data.wallet.balance;
		transactions = [...JSON.parse(data.wallet.newTransactions, jsonReviver), ...transactions];
	};

	const initWorker = async () => (worker = await initWalletWorker());

	$: worker,
		$missionControlStore,
		(async () => {
			if (isNullish($missionControlStore)) {
				worker?.stop();
				return;
			}

			worker?.start({
				missionControlId: $missionControlStore,
				callback: syncState
			});
		})();

	/**
	 * Lifecycle
	 */

	onMount(async () => await Promise.all([initWorker(), loadCredits()]));
	onDestroy(() => worker?.stop());
</script>

{#if $authSignedInStore}
	<div class="card-container columns-3">
		<div>
			<Value>
				<svelte:fragment slot="label">{$i18n.mission_control.account_identifier}</svelte:fragment>
				<p>
					<Identifier identifier={accountIdentifier?.toHex() ?? ''} />
				</p>
			</Value>

			<Value>
				<svelte:fragment slot="label">{$i18n.mission_control.balance}</svelte:fragment>
				<p>{formatE8sICP(balance)} ICP</p>
			</Value>

			<Value>
				<svelte:fragment slot="label">{$i18n.mission_control.credits}</svelte:fragment>
				<p>{formatE8sICP(credits)}</p>
			</Value>
		</div>

		<div>
			{#if nonNullish(accountIdentifier)}
				<QRCodeContainer
					value={accountIdentifier.toHex()}
					ariaLabel={$i18n.mission_control.account_identifier}
				/>
			{/if}
		</div>
	</div>

	<MissionControlTransactions {transactions} />
{/if}
