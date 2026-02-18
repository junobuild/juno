<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { JunoModalAutomationConfigDetail, JunoModalDetail } from '$lib/types/modal';
	import AutomationKeysConfigForm from '$lib/components/satellites/automation/settings/AutomationKeysConfigForm.svelte';
	import type { AddAccessKeyScope } from '$lib/types/access-keys';
	import { updateAutomationKeysConfig } from '$lib/services/satellite/automation/automation.config.edit.services';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail: d, onclose }: Props = $props();

	let detail = $derived(d as JunoModalAutomationConfigDetail);

	let satellite = $derived(detail.satellite);
	let automationConfig = $derived(detail.automationConfig);
	let providerConfig = $derived(detail.providerConfig);

	let scope = $state<Omit<AddAccessKeyScope, 'admin'> | undefined>(undefined);
	let maxTimeToLive = $state<bigint | undefined>(undefined);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		wizardBusy.start();
		step = 'in_progress';

		const { success } = await updateAutomationKeysConfig({
			satellite,
			identity: $authIdentity,
			automationConfig,
			providerConfig,
			maxTimeToLive,
			scope
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			step = 'init';
			return;
		}

		step = 'ready';
	};
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<div class="msg">
			<p>{$i18n.core.configuration_applied}</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.core.updating_configuration}</p>
		</SpinnerModal>
	{:else}
		<AutomationKeysConfigForm
			config={providerConfig}
			onsubmit={handleSubmit}
			bind:scope
			bind:maxTimeToLive
		/>
	{/if}
</Modal>

<style lang="scss">
	@use '../../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
