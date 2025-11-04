<script lang="ts">
	import {
		fromNullable,
		fromNullishNullable, isEmptyString,
		isNullish,
		nonNullish,
		notEmptyString
	} from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { SatelliteDid, MissionControlDid } from '$declarations';
	import AuthConfigAdvancedOptions from '$lib/components/auth/AuthConfigAdvancedOptions.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { sortedSatelliteCustomDomains } from '$lib/derived/satellite-custom-domains.derived';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteUrl as satelliteUrlUtils } from '$lib/utils/satellite.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import Input from '$lib/components/ui/Input.svelte';
	import { onMount } from 'svelte';
	import {
		FIVE_YEARS,
		ONE_MONTH,
		ONE_YEAR,
		SIX_MONTHS,
		THREE_MONTHS,
		TWO_YEARS
	} from '$lib/constants/canister.constants';
	import type { JunoModalEditCanisterSettingsDetail } from '$lib/types/modal';
	import {
		A_MONTH_NS,
		A_WEEK_NS,
		AN_HOUR_NS,
		AUTH_DEFAULT_MAX_SESSION_TIME_TO_LIVE,
		EIGHT_HOURS_NS,
		FOUR_HOURS_NS,
		HALF_DAY_NS,
		ONE_DAY_NS,
		TWO_HOURS_NS,
		TWO_WEEKS_NS
	} from '$lib/constants/auth.constants';

	interface Props {
		config: SatelliteDid.AuthenticationConfig | undefined;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
		clientId: string;
	}

	let { onsubmit, config, clientId = $bindable('') }: Props = $props();

	let openid = $state(fromNullable(config?.openid ?? []));
	let google = $state(openid?.providers.find(([key]) => 'Google' in key));
	let providerData = $state(google?.[1]);
	let delegation = $state(fromNullable(providerData?.delegation ?? []));
	let googleEnabled = $state(nonNullish(google));

	// Client ID
	let clientIdInput = $state(providerData?.client_id ?? '');

	$effect(() => {
		clientId = clientIdInput;
	});

	// Max time to live
	let maxTimeToLive = $state(
		Number(
			fromNullable(delegation?.max_time_to_live ?? []) ?? AUTH_DEFAULT_MAX_SESSION_TIME_TO_LIVE
		)
	);

	let customMaxTimeToLive = $state(false);
	onMount(() => {
		// Only evaluated onMount as we do not want to toggle between input or select
		// if the dev enters one of the values.
		customMaxTimeToLive =
			nonNullish(maxTimeToLive) &&
			BigInt(maxTimeToLive) !== AN_HOUR_NS &&
			BigInt(maxTimeToLive) !== TWO_HOURS_NS &&
			BigInt(maxTimeToLive) !== FOUR_HOURS_NS &&
			BigInt(maxTimeToLive) !== EIGHT_HOURS_NS &&
			BigInt(maxTimeToLive) !== HALF_DAY_NS &&
			BigInt(maxTimeToLive) !== ONE_DAY_NS &&
			BigInt(maxTimeToLive) !== A_WEEK_NS &&
			BigInt(maxTimeToLive) !== TWO_WEEKS_NS &&
			BigInt(maxTimeToLive) !== A_MONTH_NS;
	});

	let disabled = $derived(
		isEmptyString(clientId) || !/^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(clientId)
	);
</script>

<h2>Google</h2>

<p>
	{i18nFormat(
		googleEnabled
			? $i18n.authentication.edit_provider
			: $i18n.authentication.edit_to_enable_provider,
		[
			{
				placeholder: '{0}',
				value: 'Google'
			}
		]
	)}
</p>

<form class="content" {onsubmit}>
	<div class="container">
		<div>
			<Value>
				{#snippet label()}
					{$i18n.authentication.client_id}
				{/snippet}

				<Input
					name="client_id"
					inputType="text"
					placeholder={$i18n.authentication.client_id_placeholder}
					required={true}
					bind:value={clientIdInput}
				/>
			</Value>
		</div>

		<div>
			<Value>
				{#snippet label()}
					{$i18n.authentication.session_duration}{#if customMaxTimeToLive}
						({$i18n.authentication.in_nanoseconds}){/if}
				{/snippet}

				{#if customMaxTimeToLive}
					<Input
						name="maxTimeToLive"
						inputType="number"
						placeholder=""
						bind:value={maxTimeToLive}
					/>
				{:else}
					<select name="maxTimeToLive" bind:value={maxTimeToLive}>
						<option value={Number(AN_HOUR_NS)}> {$i18n.core.an_hour} </option>
						<option value={Number(TWO_HOURS_NS)}> {$i18n.core.two_hours} </option>
						<option value={Number(FOUR_HOURS_NS)}> {$i18n.core.four_hours} </option>
						<option value={Number(EIGHT_HOURS_NS)}> {$i18n.core.eight_hours} </option>
						<option value={Number(HALF_DAY_NS)}> {$i18n.core.half_day} </option>
						<option value={Number(ONE_DAY_NS)}> {$i18n.core.a_day} </option>
						<option value={Number(A_WEEK_NS)}> {$i18n.core.a_week} </option>
						<option value={Number(TWO_WEEKS_NS)}> {$i18n.core.two_weeks} </option>
						<option value={Number(A_MONTH_NS)}> {$i18n.core.a_month} </option>
					</select>
				{/if}
			</Value>
		</div>
	</div>

	<button disabled={disabled || $isBusy} type="submit">
		{$i18n.core.submit}
	</button>
</form>
