<script lang="ts">
	import { fromNullable, isEmptyString, nonNullish, notEmptyString } from '@dfinity/utils';
	import type { PrincipalText } from '@dfinity/zod-schemas';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { MissionControlDid, SatelliteDid } from '$declarations';
	import AuthConfigFormGoogleOptions from '$lib/components/auth/AuthConfigFormGoogleOptions.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
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
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		satellite: MissionControlDid.Satellite;
		config: SatelliteDid.AuthenticationConfig | undefined;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
		clientId: string | undefined;
		maxTimeToLive: bigint | undefined;
		allowedTargets: PrincipalText[] | null | undefined;
	}

	let {
		satellite,
		onsubmit,
		config,
		clientId = $bindable(undefined),
		maxTimeToLive = $bindable(),
		allowedTargets = $bindable(undefined)
	}: Props = $props();

	let openid = $state(fromNullable(config?.openid ?? []));
	let google = $state(openid?.providers.find(([key]) => 'Google' in key));
	let providerData = $state(google?.[1]);
	let delegation = $state(fromNullable(providerData?.delegation ?? []));
	let googleEnabled = $state(nonNullish(google));

	// Client ID
	let currentClientId = $state(providerData?.client_id);
	let clientIdInput = $state(currentClientId ?? '');

	$effect(() => {
		clientId = notEmptyString(clientIdInput) ? clientIdInput : undefined;
	});

	// Max time to live
	let maxTimeToLiveInput = $state(
		Number(
			fromNullable(delegation?.max_time_to_live ?? []) ?? AUTH_DEFAULT_MAX_SESSION_TIME_TO_LIVE
		)
	);

	$effect(() => {
		maxTimeToLive = BigInt(maxTimeToLiveInput);
	});

	let customMaxTimeToLive = $state(false);
	onMount(() => {
		// Only evaluated onMount as we do not want to toggle between input or select
		// if the dev enters one of the values.
		customMaxTimeToLive =
			nonNullish(maxTimeToLiveInput) &&
			BigInt(maxTimeToLiveInput) !== AN_HOUR_NS &&
			BigInt(maxTimeToLiveInput) !== TWO_HOURS_NS &&
			BigInt(maxTimeToLiveInput) !== FOUR_HOURS_NS &&
			BigInt(maxTimeToLiveInput) !== EIGHT_HOURS_NS &&
			BigInt(maxTimeToLiveInput) !== HALF_DAY_NS &&
			BigInt(maxTimeToLiveInput) !== ONE_DAY_NS &&
			BigInt(maxTimeToLiveInput) !== A_WEEK_NS &&
			BigInt(maxTimeToLiveInput) !== TWO_WEEKS_NS &&
			BigInt(maxTimeToLiveInput) !== A_MONTH_NS;
	});

	let warnClientId = $derived(isEmptyString(clientId) && notEmptyString(currentClientId));
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
					required={false}
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
						bind:value={maxTimeToLiveInput}
					/>
				{:else}
					<select name="maxTimeToLive" bind:value={maxTimeToLiveInput}>
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

		<AuthConfigFormGoogleOptions {delegation} {satellite} bind:allowedTargets />

		{#if warnClientId}
			<div class="warn" in:fade>
				<Warning>{$i18n.authentication.client_id_warn}</Warning>
			</div>
		{/if}
	</div>

	<button disabled={$isBusy} type="submit">
		{$i18n.core.submit}
	</button>
</form>
