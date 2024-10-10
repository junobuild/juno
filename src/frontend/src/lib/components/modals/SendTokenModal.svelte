<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalSendTokenDetail } from '$lib/types/modal';
	import WalletForm from '$lib/components/wallet/WalletForm.svelte';

	export let detail: JunoModalDetail;

	let balance: bigint | undefined;
	$: ({ balance } = detail as JunoModalSendTokenDetail);

	let steps: 'form' | 'review' | 'in_progress' | 'ready' | 'error';
</script>

<svelte:window on:junoSyncBalance={({ detail: syncBalance }) => (balance = syncBalance)} />

{#if nonNullish($missionControlStore)}
	<Modal on:junoClose>
		{#if steps === 'ready'}
			<div class="msg">
				<p>Done</p>
				<button on:click={close}>{$i18n.core.close}</button>
			</div>
		{:else if steps === 'in_progress'}
			<SpinnerModal>
				<p>{$i18n.canisters.upgrade_in_progress}</p>
			</SpinnerModal>
		{:else if steps === 'review'}{:else}
			<WalletForm {balance} />
		{/if}
	</Modal>
{/if}
