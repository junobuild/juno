<script lang="ts">
	import { fromNullishNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { AUTH_CONFIG_CONTEXT_KEY, type AuthConfigContext } from '$lib/types/auth.context';
	import type { JunoModalEditAuthConfigDetailType } from '$lib/types/modal';

	interface Props {
		openModal: (params: JunoModalEditAuthConfigDetailType) => Promise<void>;
	}

	let { openModal }: Props = $props();

	const { config, supportConfig } = getContext<AuthConfigContext>(AUTH_CONFIG_CONTEXT_KEY);

	let derivationOrigin = $derived(
		fromNullishNullable(fromNullishNullable($config?.internet_identity)?.derivation_origin)
	);
	let externalAlternativeOrigins = $derived(
		fromNullishNullable(
			fromNullishNullable($config?.internet_identity)?.external_alternative_origins
		)
	);

	const openEditModal = async () =>
		await openModal({
			internet_identity: null
		});
</script>

<div class="card-container with-title">
	<span class="title">Internet Identity</span>

	<div class="columns-3 fit-column-1">
		<div>
			{#if $supportConfig}
				<div>
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
					<div>
						<Value>
							{#snippet label()}
								{$i18n.authentication.external_alternative_origins}
							{/snippet}

							<p>{externalAlternativeOrigins.join(',')}</p>
						</Value>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<button disabled={!$supportConfig} onclick={openEditModal}>{$i18n.core.configure}</button>

<style lang="scss">
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/media';

	p {
		@include text.truncate;
	}

	button {
		margin: 0 0 var(--padding-8x);
	}
</style>
