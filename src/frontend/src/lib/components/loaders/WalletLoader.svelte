<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { WalletWorker } from '$lib/services/workers/worker.wallet.services';
	import { devId } from '$lib/derived/dev.derived';
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	let worker = $state<WalletWorker | undefined>();

	const initWorker = async () => {
		worker = await WalletWorker.init();
	};

	let accounts = $derived([
		...(nonNullish($devId) ? [encodeIcrcAccount({ owner: $devId })] : []),
		...(nonNullish($missionControlId) ? [encodeIcrcAccount({ owner: $missionControlId })] : [])
	]);

	$effect(() => {
		if (isNullish($devId)) {
			worker?.stop();
			return;
		}

		if ($missionControlId === undefined) {
			worker?.stop();
			return;
		}

		worker?.start({
			accounts
		});
	});

	const onRestartWallet = () => {
		if (accounts.length === 0) {
			return;
		}

		worker?.restart({ accounts });
	};

	onMount(async () => await initWorker());
	onDestroy(() => worker?.terminate());
</script>

<svelte:window onjunoRestartWallet={onRestartWallet} />

{@render children?.()}
