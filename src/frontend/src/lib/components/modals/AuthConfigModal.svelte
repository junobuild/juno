<script lang="ts">
	import { fromNullable, nonNullish, isNullish, fromNullishNullable } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type { AuthenticationConfig, Rule } from '$declarations/satellite/satellite.did';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { satelliteCustomDomains } from '$lib/derived/custom-domains.derived';
	import { updateAuthConfig } from '$lib/services/auth.config.services';
	import { authStore } from '$lib/stores/auth.store';
	import { isBusy, wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalEditAuthConfigDetail } from '$lib/types/modal';
	import { emit } from '$lib/utils/events.utils';
	import { satelliteUrl as satelliteUrlUtils } from '$lib/utils/satellite.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let satellite: Satellite = $state((detail as JunoModalEditAuthConfigDetail).satellite);

	let satelliteUrl: URL | null = $derived(
		URL.parse(satelliteUrlUtils(satellite.satellite_id.toText()))
	);

	let customDomains: URL[] = $derived(
		$satelliteCustomDomains
			.map(([customDomain, _]) => URL.parse(`https://${customDomain}`))
			.filter(nonNullish)
	);

	let rule: Rule | undefined = $state((detail as JunoModalEditAuthConfigDetail).rule);

	let config: AuthenticationConfig | undefined = $state(
		(detail as JunoModalEditAuthConfigDetail).config
	);

	let currentDerivationOrigin: string | undefined = $state(
		fromNullable(
			fromNullishNullable((detail as JunoModalEditAuthConfigDetail).config?.internet_identity)
				?.derivation_origin ?? []
		)
	);

	let derivationOrigin: string | undefined = $state(
		fromNullable(
			fromNullishNullable((detail as JunoModalEditAuthConfigDetail).config?.internet_identity)
				?.derivation_origin ?? []
		)
	);

	let warnDerivationOrigin = $derived(
		(nonNullish(currentDerivationOrigin) && derivationOrigin !== currentDerivationOrigin) ||
			(isNullish(currentDerivationOrigin) && nonNullish(derivationOrigin) && nonNullish(config))
	);

	let maxTokens: number | undefined = $state(
		nonNullish(
			fromNullishNullable((detail as JunoModalEditAuthConfigDetail).rule?.rate_config)?.max_tokens
		)
			? Number(
					fromNullishNullable((detail as JunoModalEditAuthConfigDetail).rule?.rate_config)
						?.max_tokens ?? 0
				)
			: undefined
	);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		wizardBusy.start();
		step = 'in_progress';

		const selectedDerivationOrigin = nonNullish(derivationOrigin)
			? [...(nonNullish(satelliteUrl) ? [satelliteUrl] : []), ...customDomains].find(
					({ host }) => host === derivationOrigin
				)
			: undefined;

		const { success } = await updateAuthConfig({
			satellite,
			identity: $authStore.identity,
			maxTokens,
			rule,
			derivationOrigin: selectedDerivationOrigin,
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

<Modal on:junoClose={onclose}>
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
		<h2>{$i18n.core.config}</h2>

		<p>{$i18n.authentication.edit_configuration}</p>

		<form class="content" onsubmit={handleSubmit}>
			<div class="container">
				<div>
					<div>
						<Value>
							{#snippet label()}
								{$i18n.authentication.main_domain}
							{/snippet}

							<select id="logVisibility" name="logVisibility" bind:value={derivationOrigin}>
								<option value={undefined}>{$i18n.authentication.not_configured}</option>

								{#if nonNullish(satelliteUrl)}
									<option value={satelliteUrl.host}>{satelliteUrl.host}</option>
								{/if}

								{#each customDomains as customDomain}
									<option value={customDomain.host}>{customDomain.host}</option>
								{/each}
							</select>
						</Value>
					</div>
				</div>

				{#if nonNullish(rule)}
					<div>
						<Value>
							{#snippet label()}
								{$i18n.collections.rate_limit}
							{/snippet}

							<Input
								inputType="number"
								placeholder={$i18n.collections.rate_limit_placeholder}
								name="maxTokens"
								required={false}
								bind:value={maxTokens}
								onblur={() =>
									(maxTokens = nonNullish(maxTokens) ? Math.trunc(maxTokens) : undefined)}
							/>
						</Value>
					</div>
				{/if}

				{#if warnDerivationOrigin}
					<div class="warn" in:fade>
						<Warning>{$i18n.authentication.main_domain_warn}</Warning>
					</div>
				{/if}
			</div>

			<button type="submit" disabled={$isBusy}>
				{$i18n.core.submit}
			</button>
		</form>
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
