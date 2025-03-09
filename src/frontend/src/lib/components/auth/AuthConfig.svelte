<script lang="ts">
	import { isNullish, nonNullish, fromNullishNullable } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type { AuthenticationConfig, Rule } from '$declarations/satellite/satellite.did';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { getAuthConfig } from '$lib/services/auth.config.services';
	import { getRuleUser } from '$lib/services/collection.services';
	import { listCustomDomains } from '$lib/services/custom-domain.services';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id);

	let rule: Rule | undefined = $state<Rule | undefined>(undefined);
	let supportSettings = $state(false);

	let maxTokens: number | undefined = $state(undefined);

	const loadRule = async () => {
		const result = await getRuleUser({ satelliteId, identity: $authStore.identity });
		rule = result?.rule;
		supportSettings = result?.result === 'success';
	};

	let supportConfig = $state(false);
	let config: AuthenticationConfig | undefined = $state();
	let derivationOrigin = $derived(
		fromNullishNullable(fromNullishNullable(config?.internet_identity)?.derivation_origin)
	);
	let externalAlternativeOrigins = $derived(
		fromNullishNullable(
			fromNullishNullable(config?.internet_identity)?.external_alternative_origins
		)
	);

	const loadConfig = async () => {
		const result = await getAuthConfig({
			satelliteId,
			identity: $authStore.identity
		});

		config = result.config;
		supportConfig = result.result === 'success';
	};

	const load = async () => {
		await Promise.all([loadConfig(), loadRule()]);
	};

	$effect(() => {
		load();
	});

	$effect(() => {
		const rateConfig = fromNullishNullable(rule?.rate_config);
		maxTokens = nonNullish(rateConfig?.max_tokens) ? Number(rateConfig.max_tokens) : undefined;
	});

	const openModal = async () => {
		busy.start();

		const { success } = await listCustomDomains({ satelliteId, reload: false });

		busy.stop();

		if (!success) {
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'edit_auth_config',
				detail: {
					rule,
					config,
					satellite
				}
			}
		});
	};
</script>

<svelte:window onjunoReloadAuthConfig={load} />

<div class="card-container with-title">
	<span class="title">{$i18n.core.config}</span>

	<div class="content">
		<div>
			{#if supportConfig}
				<div in:fade>
					<Value>
						{#snippet label()}
							{$i18n.authentication.main_domain}
						{/snippet}

						{#if isNullish(derivationOrigin)}
							<p>{$i18n.authentication.not_configured}</p>
						{:else}
							<p>{derivationOrigin}</p>
						{/if}
					</Value>
				</div>

				{#if nonNullish(externalAlternativeOrigins)}
					<div in:fade>
						<Value>
							{#snippet label()}
								{$i18n.authentication.external_alternative_origins}
							{/snippet}

							<p>{externalAlternativeOrigins.join(',')}</p>
						</Value>
					</div>
				{/if}
			{/if}

			{#if supportSettings}
				<div in:fade>
					<Value>
						{#snippet label()}
							{$i18n.collections.rate_limit}
						{/snippet}

						{#if isNullish(rule)}
							<p><SkeletonText /></p>
						{:else if isNullish(maxTokens)}
							<p>{$i18n.collections.no_rate_limit}</p>
						{:else}
							<p>{maxTokens}</p>
						{/if}
					</Value>
				</div>
			{/if}
		</div>
	</div>
</div>

{#if supportConfig || supportSettings}
	<button in:fade onclick={openModal}>{$i18n.core.edit_config}</button>
{/if}

<style lang="scss">
	@use '../../styles/mixins/text';

	.card-container {
		min-height: 166px;
	}

	p {
		@include text.truncate;
	}
</style>
