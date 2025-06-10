<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type { AuthenticationConfig, Rule } from '$declarations/satellite/satellite.did';
	import AuthConfigForm from '$lib/components/auth/AuthConfigForm.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { updateAuthConfig } from '$lib/services/auth/auth.config.services';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalEditAuthConfigDetail } from '$lib/types/modal';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let satellite: Satellite = $state((detail as JunoModalEditAuthConfigDetail).satellite);

	let rule: Rule | undefined = $state((detail as JunoModalEditAuthConfigDetail).rule);

	let config: AuthenticationConfig | undefined = $state(
		(detail as JunoModalEditAuthConfigDetail).config
	);

	let maxTokens = $state<number | undefined>(undefined);

	let selectedDerivationOrigin = $state<URL | undefined>(undefined);

	let externalAlternativeOrigins = $state('');

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		wizardBusy.start();
		step = 'in_progress';

		const { success } = await updateAuthConfig({
			satellite,
			identity: $authStore.identity,
			maxTokens,
			rule,
			derivationOrigin: selectedDerivationOrigin,
			externalAlternativeOrigins,
			config
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			step = 'init';
			return;
		}

		emit({ message: 'junoReloadAuthConfig' });

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
		<AuthConfigForm
			{satellite}
			{config}
			{rule}
			onsubmit={handleSubmit}
			bind:maxTokens
			bind:selectedDerivationOrigin
			bind:externalAlternativeOrigins
		/>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}

	.container {
		margin: var(--padding-4x) 0;
	}

	.warn {
		padding: var(--padding-2x) 0 0;
	}
</style>
