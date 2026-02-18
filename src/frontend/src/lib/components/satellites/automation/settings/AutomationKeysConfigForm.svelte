<script lang="ts">
	import { fromNullable, nonNullish, notEmptyString } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import type { SatelliteDid } from '$declarations';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		AN_HOUR_NS,
		FIFTEEN_MINUTES_NS,
		FIVE_MINUTES_NS,
		FORTY_FIVE_MINUTES_NS,
		TEN_MINUTES_NS,
		THIRTY_MINUTES_NS,
		TWO_MINUTES_NS
	} from '$lib/constants/duration.constants';
	import { isBusy } from '$lib/derived/app/busy.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { AUTOMATION_DEFAULT_MAX_SESSION_TIME_TO_LIVE } from '$lib/constants/automation.constants';
	import type { AddAccessKeyScope } from '$lib/types/access-keys';

	interface Props {
		config: SatelliteDid.OpenIdAutomationProviderConfig;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
		scope: Omit<AddAccessKeyScope, 'admin'> | undefined;
		maxTimeToLive: bigint | undefined;
	}

	let { onsubmit, config, scope = $bindable(), maxTimeToLive = $bindable() }: Props = $props();

	// svelte-ignore state_referenced_locally
	let controller = $state(fromNullable(config?.controller));
	let controllerScope = $state(fromNullable(controller?.scope ?? []));

	// Scope
	let scopeInput = $state(
		nonNullish(controllerScope) && 'Submit' in controllerScope ? 'submit' : 'write'
	);

	$effect(() => {
		scope = notEmptyString(scopeInput) ? scopeInput : 'write';
	});

	// Max time to live
	let maxTimeToLiveInput = $state(
		Number(
			fromNullable(controller?.max_time_to_live ?? []) ??
				AUTOMATION_DEFAULT_MAX_SESSION_TIME_TO_LIVE
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
			BigInt(maxTimeToLiveInput) !== TWO_MINUTES_NS &&
			BigInt(maxTimeToLiveInput) !== FIVE_MINUTES_NS &&
			BigInt(maxTimeToLiveInput) !== TEN_MINUTES_NS &&
			BigInt(maxTimeToLiveInput) !== FIFTEEN_MINUTES_NS &&
			BigInt(maxTimeToLiveInput) !== THIRTY_MINUTES_NS &&
			BigInt(maxTimeToLiveInput) !== FORTY_FIVE_MINUTES_NS &&
			BigInt(maxTimeToLiveInput) !== AN_HOUR_NS;
	});
</script>

<h2>{$i18n.automation.keys}</h2>

<p>
	{$i18n.automation.edit_automation_keys}
</p>

<form class="content" {onsubmit}>
	<div class="container">
		<div>
			<Value>
				{#snippet label()}
					{$i18n.controllers.scope}
				{/snippet}

				<select name="scope" bind:value={scope}>
					<option value="submit">{$i18n.controllers.submit}</option>
					<option value="write">{$i18n.controllers.write}</option>
				</select>
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
						<option value={Number(TWO_MINUTES_NS)}> {$i18n.core.two_minutes} </option>
						<option value={Number(FIVE_MINUTES_NS)}> {$i18n.core.five_minutes} </option>
						<option value={Number(TEN_MINUTES_NS)}> {$i18n.core.ten_minutes} </option>
						<option value={Number(FIFTEEN_MINUTES_NS)}> {$i18n.core.fifteen_minutes} </option>
						<option value={Number(THIRTY_MINUTES_NS)}> {$i18n.core.thirty_minutes} </option>
						<option value={Number(FORTY_FIVE_MINUTES_NS)}> {$i18n.core.forty_five_minutes} </option>
						<option value={Number(AN_HOUR_NS)}> {$i18n.core.an_hour} </option>
					</select>
				{/if}
			</Value>
		</div>
	</div>

	<button disabled={$isBusy} type="submit">
		{$i18n.core.submit}
	</button>
</form>
