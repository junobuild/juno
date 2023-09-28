<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { TransactionWithId } from '@junobuild/ledger';
	import { i18n } from '$lib/stores/i18n.store';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import { busy } from '$lib/stores/busy.store';
	import { toasts } from '$lib/stores/toasts.store';

	export let missionControlId: Principal;
	export let transactions: TransactionWithId[];

	let visible = false;

	const close = () => (visible = false);

	const exportTransactions = async () => {
		busy.start();

		try {
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.transactions_export,
				detail: err
			});
		}

		close();

		busy.stop();
	};
</script>

<button type="button" on:click={() => (visible = true)}>{$i18n.core.export}</button>

<Confirmation bind:visible on:junoYes={exportTransactions} on:junoNo={close}>
	<svelte:fragment slot="title">{$i18n.wallet.export_title}</svelte:fragment>

	<p>{$i18n.wallet.export_info}</p>
</Confirmation>
