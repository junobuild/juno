<script lang="ts">
	import { fromNullishNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { SatelliteDid } from '$declarations';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type {
		JunoModalEditAuthConfigDetail,
		JunoModalEditAuthConfigDetailCore,
		JunoModalEditAuthConfigDetailII,
		JunoModalEditAuthConfigDetailType
	} from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		config: SatelliteDid.AuthenticationConfig | undefined;
		rule: SatelliteDid.Rule | undefined;
		supportConfig: boolean;
		supportSettings: boolean;
		openModal: (params: JunoModalEditAuthConfigDetailType) => Promise<void>;
	}

	let { config, rule, supportConfig, supportSettings, openModal }: Props = $props();

	let allowedCallers = $derived(fromNullishNullable(config?.rules)?.allowed_callers);

	let maxTokens: number | undefined = $state(undefined);

	$effect(() => {
		const rateConfig = fromNullishNullable(rule?.rate_config);
		maxTokens = nonNullish(rateConfig?.max_tokens) ? Number(rateConfig.max_tokens) : undefined;
	});

	const openEditModal = async () =>
		await openModal({
			core: {
				rule
			}
		});
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.core.config}</span>

	<div class="columns-3 fit-column-1">
		<div>
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

		<div>
			{#if supportConfig}
				<div in:fade>
					<Value>
						{#snippet label()}
							{$i18n.authentication.allowed_callers}
						{/snippet}

						{#if isNullish(allowedCallers) || allowedCallers.length === 0}
							<p>{$i18n.authentication.no_restrictions}</p>
						{:else if allowedCallers.length === 1}
							<p>{$i18n.authentication.one_identity}</p>
						{:else}
							<p>
								{i18nFormat($i18n.authentication.identities, [
									{
										placeholder: '{0}',
										value: `${allowedCallers.length}`
									}
								])}
							</p>
						{/if}
					</Value>
				</div>
			{/if}
		</div>
	</div>
</div>

<button disabled={!supportConfig || !supportSettings} onclick={openEditModal} in:fade
	>{$i18n.core.edit_config}</button
>

<style lang="scss">
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/media';

	.card-container {
		min-height: 168px;

		@include media.min-width(medium) {
			min-height: 94px;
		}
	}

	p {
		@include media.min-width(medium) {
			margin: 0;
		}

		@include text.truncate;
	}

	button {
		margin: 0 0 var(--padding-8x);
	}
</style>
