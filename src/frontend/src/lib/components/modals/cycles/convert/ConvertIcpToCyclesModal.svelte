<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import CanisterTopUpModal from '$lib/components/modals/cycles/top-up/CanisterTopUpModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import Modal from '$lib/components/ui/Modal.svelte';
	import {convertIcpToCycles} from "$lib/services/convert/convert.services";
	import {authIdentity} from "$lib/derived/auth.derived";
	import type {JunoModalConvertIcpToCyclesDetails, JunoModalDetail, JunoModalWalletDetail} from "$lib/types/modal";
	import {devIcpBalanceOrZero} from "$lib/derived/wallet/balance.derived";

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { onclose, detail }: Props = $props();

	let { selectedWallet } = $derived(detail as JunoModalConvertIcpToCyclesDetails);

	let step: 'init' | 'review' | 'in_progress' | 'ready' | 'error' = $state('init');

	const test = async () => {
		await convertIcpToCycles({
			selectedWallet,
			identity: $authIdentity,
			amount: '10',
			balance: $devIcpBalanceOrZero
		})
    };
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<div class="msg">
			Ok
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}{:else if step === 'review'}{:else}
		<button onclick={test}>Test</button>
	{/if}
</Modal>
