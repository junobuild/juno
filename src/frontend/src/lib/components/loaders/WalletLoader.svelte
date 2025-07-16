<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { WalletWorker } from '$lib/services/workers/worker.wallet.services';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	let worker = $state<WalletWorker | undefined>();

	const initWorker = async () => {
		worker = await WalletWorker.init();
	};
	onDestroy(() => worker?.terminate());

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
