<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import {
		fromNullable,
		fromNullishNullable,
		isNullish,
		nonNullish,
		notEmptyString
	} from '@dfinity/utils';
	import { PrincipalTextSchema } from '@dfinity/zod-schemas';
	import { fade } from 'svelte/transition';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type { AuthenticationConfig, Rule } from '$declarations/satellite/satellite.did';
	import AuthConfigAdvancedOptions from '$lib/components/auth/AuthConfigAdvancedOptions.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { sortedSatelliteCustomDomains } from '$lib/derived/satellite-custom-domains.derived';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteUrl as satelliteUrlUtils } from '$lib/utils/satellite.utils';

	interface Props {
		config: AuthenticationConfig | undefined;
		selectedDerivationOrigin: URL | undefined;
		satellite: Satellite;
		rule: Rule | undefined;
		maxTokens: number | undefined;
		externalAlternativeOrigins: string;
		allowedCallers: Principal[];
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let {
		onsubmit,
		selectedDerivationOrigin = $bindable(undefined),
		config,
		satellite,
		rule,
		maxTokens = $bindable(undefined),
		externalAlternativeOrigins = $bindable(''),
		allowedCallers = $bindable([])
	}: Props = $props();

	let satelliteUrl: URL | null = $derived(
		URL.parse(satelliteUrlUtils(satellite.satellite_id.toText()))
	);

	let customDomains: URL[] = $derived(
		$sortedSatelliteCustomDomains
			.map(([customDomain, _]) => URL.parse(`https://${customDomain}`))
			.filter(nonNullish)
	);

	let currentDerivationOrigin = $state<string | undefined>(
		fromNullable(fromNullishNullable(config?.internet_identity)?.derivation_origin ?? [])
	);

	let derivationOrigin = $state<string | undefined>(
		fromNullable(fromNullishNullable(config?.internet_identity)?.derivation_origin ?? [])
	);

	$effect(() => {
		selectedDerivationOrigin = nonNullish(derivationOrigin)
			? [...(nonNullish(satelliteUrl) ? [satelliteUrl] : []), ...customDomains].find(
					({ host }) => host === derivationOrigin
				)
			: undefined;
	});

	let warnDerivationOrigin = $derived(
		(nonNullish(currentDerivationOrigin) && derivationOrigin !== currentDerivationOrigin) ||
			(isNullish(currentDerivationOrigin) && nonNullish(derivationOrigin) && nonNullish(config))
	);

	let maxTokensInput = $state<number | undefined>(
		nonNullish(fromNullishNullable(rule?.rate_config)?.max_tokens)
			? Number(fromNullishNullable(rule?.rate_config)?.max_tokens ?? 0)
			: undefined
	);

	$effect(() => {
		maxTokens = maxTokensInput;
	});

	let allowedCallersInput = $state<string>(
		(fromNullishNullable(config?.rules)?.allowed_callers ?? [])
			.map((caller) => caller.toText())
			.join('\n')
	);

	$effect(() => {
		allowedCallers = allowedCallersInput
			.split(/[\n,]+/)
			.map((input) => input.toLowerCase().trim())
			.filter(notEmptyString)
			.filter((input) => PrincipalTextSchema.safeParse(input).success)
			.map((input) => Principal.fromText(input));
	});
</script>

<h2>{$i18n.core.config}</h2>

<p>{$i18n.authentication.edit_configuration}</p>

<form class="content" {onsubmit}>
	<div class="container">
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

					{#each customDomains as customDomain (customDomain.host)}
						<option value={customDomain.host}>{customDomain.host}</option>
					{/each}
				</select>
			</Value>
		</div>

		{#if nonNullish(rule)}
			<div>
				<Value>
					{#snippet label()}
						{$i18n.collections.rate_limit}
					{/snippet}

					<Input
						name="maxTokens"
						inputType="number"
						onblur={() =>
							(maxTokensInput = nonNullish(maxTokensInput)
								? Math.trunc(maxTokensInput)
								: undefined)}
						placeholder={$i18n.collections.rate_limit_placeholder}
						required={false}
						bind:value={maxTokensInput}
					/>
				</Value>
			</div>
		{/if}

		<div>
			<Value>
				{#snippet label()}
					{$i18n.authentication.allowed_callers}
				{/snippet}

				<textarea
					placeholder={$i18n.authentication.allowed_callers_placeholder}
					rows="5"
					bind:value={allowedCallersInput}
				></textarea>
			</Value>
		</div>

		<AuthConfigAdvancedOptions {config} bind:externalAlternativeOrigins />

		{#if warnDerivationOrigin}
			<div class="warn" in:fade>
				<Warning>{$i18n.authentication.main_domain_warn}</Warning>
			</div>
		{/if}
	</div>

	<button disabled={$isBusy} type="submit">
		{$i18n.core.submit}
	</button>
</form>
