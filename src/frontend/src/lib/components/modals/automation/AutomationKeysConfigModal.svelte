<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { PrincipalText } from '@dfinity/zod-schemas';
	import type { Principal } from '@icp-sdk/core/principal';
	import AuthConfigFormCore from '$lib/components/satellites/auth/AuthConfigFormCore.svelte';
	import AuthConfigFormGoogle from '$lib/components/satellites/auth/AuthConfigFormGoogle.svelte';
	import AuthConfigFormII from '$lib/components/satellites/auth/AuthConfigFormII.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { isSkylab } from '$lib/env/app.env';
	import { emulatorToggleOpenIdMonitoring } from '$lib/services/emulator.services';
	import {
		updateAuthConfigRules,
		updateAuthConfigInternetIdentity,
		type UpdateAuthConfigResult,
		updateAuthConfigGoogle
	} from '$lib/services/satellite/authentication/auth.config.services';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type {
		JunoModalAutomationConfigDetail,
		JunoModalDetail,
		JunoModalEditAuthConfigDetail
	} from '$lib/types/modal';
	import { emit } from '$lib/utils/events.utils';
	import AutomationKeysConfigForm
		from "$lib/components/satellites/automation/settings/AutomationKeysConfigForm.svelte";
	import type {AddAccessKeyScope} from "$lib/types/access-keys";

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail: d, onclose }: Props = $props();

	let detail = $derived(d as JunoModalAutomationConfigDetail);

	let satellite = $derived(detail.satellite);
    let config = $derived(detail.config);

	let scope = $state<Omit<AddAccessKeyScope, 'admin'> | undefined>(undefined);
	let maxTimeToLive = $state<bigint | undefined>(undefined);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		wizardBusy.start();
		step = 'in_progress';

		const update = (): Promise<UpdateAuthConfigResult> => {
			const commonPayload = {
				satellite,
				identity: $authIdentity,
				config
			};

			if (edit === 'internet_identity') {
				return updateAuthConfigInternetIdentity({
					...commonPayload,
					derivationOrigin: selectedDerivationOrigin,
					externalAlternativeOrigins
				});
			}

			if (edit === 'google') {
				return updateAuthConfigGoogle({
					...commonPayload,
					clientId: googleClientId,
					maxTimeToLive: googleMaxTimeToLive,
					allowedTargets: $state.snapshot(googleAllowedTargets)
				});
			}

			return updateAuthConfigRules({
				...commonPayload,
				rule,
				maxTokens,
				allowedCallers
			});
		};

		const { success } = await update();

		if (isSkylab() && edit === 'google') {
			await emulatorToggleOpenIdMonitoring({
				enable: nonNullish(googleClientId)
			});
		}

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
		<AutomationKeysConfigForm
			{config}
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
