<script lang="ts">
	import type { JunoModalDetail, JunoModalMonitoringCreateBulkStrategyDetail } from '$lib/types/modal';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { settings } = $derived(detail as JunoModalMonitoringCreateBulkStrategyDetail);

	let steps: 'edit' | 'in_progress' | 'ready' = $state('edit');

	const handleSubmit = async ($event: SubmitEvent) => {};
</script>

<Modal on:junoClose={onclose}>
	{#if steps === 'ready'}
		<div class="msg">
			<p>
				{$i18n.monitoring.strategy_created}
			</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.monitoring.applying_strategy}</p>
		</SpinnerModal>
	{:else}
		<h2>{$i18n.monitoring.title}</h2>

        <p>{$i18n.monitoring.create_info}</p>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
