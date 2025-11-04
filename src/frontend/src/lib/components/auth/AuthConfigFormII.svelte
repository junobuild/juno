<script lang="ts">
	import { fromNullable, fromNullishNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { SatelliteDid, MissionControlDid } from '$declarations';
	import AuthConfigFormIIOptions from '$lib/components/auth/AuthConfigFormIIOptions.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { sortedSatelliteCustomDomains } from '$lib/derived/satellite-custom-domains.derived';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { satelliteUrl as satelliteUrlUtils } from '$lib/utils/satellite.utils';

	interface Props {
		config: SatelliteDid.AuthenticationConfig | undefined;
		selectedDerivationOrigin: URL | undefined;
		satellite: MissionControlDid.Satellite;
		externalAlternativeOrigins: string;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let {
		onsubmit,
		selectedDerivationOrigin = $bindable(undefined),
		config,
		satellite,
		externalAlternativeOrigins = $bindable('')
	}: Props = $props();

	let satelliteUrl = $derived<URL | null>(
		URL.parse(satelliteUrlUtils(satellite.satellite_id.toText()))
	);

	let customDomains = $derived<URL[]>(
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
</script>

<h2>Internet Identity</h2>

<p>
	{i18nFormat($i18n.authentication.edit_provider, [
		{
			placeholder: '{0}',
			value: 'Internet Identity'
		}
	])}
</p>

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

		<AuthConfigFormIIOptions {config} bind:externalAlternativeOrigins />

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
