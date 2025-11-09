<script lang="ts">
	import type { PrincipalText } from '@dfinity/zod-schemas';
	import type { Principal } from '@icp-sdk/core/principal';
	import AuthConfigFormCore from '$lib/components/auth/AuthConfigFormCore.svelte';
	import AuthConfigFormGoogle from '$lib/components/auth/AuthConfigFormGoogle.svelte';
	import AuthConfigFormII from '$lib/components/auth/AuthConfigFormII.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import {
		updateAuthConfigRules,
		updateAuthConfigInternetIdentity,
		type UpdateAuthConfigResult,
		updateAuthConfigGoogle
	} from '$lib/services/auth/auth.config.services';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalEditAuthConfigDetail } from '$lib/types/modal';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail: d, onclose }: Props = $props();

	let detail = $derived(d as JunoModalEditAuthConfigDetail);

	let satellite = $derived(detail.satellite);

	let rule = $derived('core' in detail ? detail.core.rule : undefined);

	let edit = $derived<'core' | 'internet_identity' | 'google'>(
		'core' in detail ? 'core' : 'internet_identity' in detail ? 'internet_identity' : 'google'
	);

	let config = $derived(detail.config);

	// Core rules
	let maxTokens = $state<number | undefined>(undefined);
	let allowedCallers = $state<Principal[]>([]);

	// Internet Identity
	let selectedDerivationOrigin = $state<URL | undefined>(undefined);
	let externalAlternativeOrigins = $state('');

	// Google
	let googleClientId = $state<string | undefined>(undefined);
	let googleMaxTimeToLive = $state<bigint | undefined>(undefined);
	let googleAllowedTargets = $state<PrincipalText[] | null | undefined>(undefined);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		wizardBusy.start();
		step = 'in_progress';

		const update = (): Promise<UpdateAuthConfigResult> => {
			const commonPayload = {
				satellite,
				identity: $authStore.identity,
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
	{:else if edit === 'google'}
		<AuthConfigFormGoogle
			{config}
			onsubmit={handleSubmit}
			{satellite}
			bind:clientId={googleClientId}
			bind:maxTimeToLive={googleMaxTimeToLive}
			bind:allowedTargets={googleAllowedTargets}
		/>
	{:else if edit === 'internet_identity'}
		<AuthConfigFormII
			{config}
			onsubmit={handleSubmit}
			{satellite}
			bind:selectedDerivationOrigin
			bind:externalAlternativeOrigins
		/>
	{:else}
		<AuthConfigFormCore
			{config}
			onsubmit={handleSubmit}
			{rule}
			bind:maxTokens
			bind:allowedCallers
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
