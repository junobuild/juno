<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { type WalletWorker, initWalletWorker } from '$lib/services/worker.wallet.services';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
		children?: Snippet;
	}

	let { missionControlId, children }: Props = $props();

	let worker: WalletWorker | undefined = $state();

	const initWorker = async () => {
		worker = await initWalletWorker();
	};

	$effect(() => {
		if (isNullish(missionControlId)) {
			worker?.stop();
			return;
		}

		worker?.start({
			missionControlId
		});
	});

	const onRestartWallet = () => {
		if (isNullish(missionControlId)) {
			return;
		}

		worker?.restart({ missionControlId });
	};

	onMount(async () => await initWorker());
	onDestroy(() => worker?.stop());
</script>

<svelte:window onjunoRestartWallet={onRestartWallet} />

{@render children?.()}
