<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { type WalletWorker, initWalletWorker } from '$lib/services/worker.wallet.services';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	let worker: WalletWorker | undefined = $state();

	const initWorker = async () => {
		worker = await initWalletWorker();
	};

	$effect(() => {
		if (isNullish($missionControlIdDerived)) {
			worker?.stop();
			return;
		}

		worker?.start({
			missionControlId: $missionControlIdDerived
		});
	});

	const onRestartWallet = () => {
		if (isNullish($missionControlIdDerived)) {
			return;
		}

		worker?.restart({ missionControlId: $missionControlIdDerived });
	};

	onMount(async () => await initWorker());
	onDestroy(() => worker?.stop());
</script>

<svelte:window onjunoRestartWallet={onRestartWallet} />

{@render children?.()}
