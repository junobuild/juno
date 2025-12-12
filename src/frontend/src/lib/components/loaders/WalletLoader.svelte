<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { WalletWorker } from '$lib/services/workers/worker.wallet.services';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	let worker = $state<WalletWorker | undefined>();

	const initWorker = async () => {
		worker = await WalletWorker.init();
	};

	$effect(() => {
		if (isNullish($missionControlId)) {
			worker?.stop();
			return;
		}

		worker?.start({
			walletIds: [encodeIcrcAccount({ owner: $missionControlId })]
		});
	});

	const onRestartWallet = () => {
		if (isNullish($missionControlId)) {
			return;
		}

		worker?.restart({ walletIds: [encodeIcrcAccount({ owner: $missionControlId })] });
	};

	onMount(async () => await initWorker());
	onDestroy(() => worker?.terminate());
</script>

<svelte:window onjunoRestartWallet={onRestartWallet} />

{@render children?.()}
