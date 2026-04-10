<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Nullish, Option } from '@dfinity/zod-schemas';
	import type { PrincipalText } from '@junobuild/schema';
	import type { MissionControlDid } from '$declarations';
	import MonitoringSentence from '$lib/components/modals/monitoring/MonitoringSentence.svelte';
	import CreateSatelliteReviewFee from '$lib/components/satellites/factory/CreateSatelliteReviewFee.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { testId } from '$lib/utils/test.utils';

	interface Props {
		satelliteName: string | undefined;
		satelliteKind: 'website' | 'application' | undefined;
		subnetId: PrincipalText | undefined;
		monitoringStrategy: MissionControlDid.CyclesMonitoringStrategy | undefined;
		disabled: boolean;
		withFee: Nullish<bigint>;
		selectedWallet: Option<SelectedWallet>;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
		onback: () => void;
	}

	let {
		satelliteName,
		satelliteKind,
		subnetId,
		monitoringStrategy,
		withFee,
		selectedWallet,
		onback,
		onsubmit,
		disabled
	}: Props = $props();
</script>

<h2>{$i18n.core.review}</h2>

<p>{$i18n.satellites.go_for_launch}</p>

<form {onsubmit}>
	<Value>
		{#snippet label()}
			{$i18n.satellites.satellite_name}
		{/snippet}

		<p>{satelliteName ?? ''}</p>
	</Value>

	<Value>
		{#snippet label()}
			{$i18n.core.config}
		{/snippet}

		<p>
			{satelliteKind === 'application'
				? $i18n.satellites.application_hint
				: $i18n.satellites.website_hint}
		</p>
	</Value>

	{#if nonNullish(subnetId)}
		<Value>
			{#snippet label()}
				{$i18n.canisters.subnet}
			{/snippet}

			<p>{subnetId}</p>
		</Value>
	{/if}

	{#if nonNullish(monitoringStrategy)}
		<Value>
			{#snippet label()}
				{$i18n.monitoring.auto_refill}
			{/snippet}

			<p><MonitoringSentence {monitoringStrategy} /></p>
		</Value>
	{/if}

	<p>
		{#if nonNullish(withFee)}
			<CreateSatelliteReviewFee fee={withFee} {selectedWallet} />
		{:else}
			{$i18n.satellites.hooray_free_satellite}
		{/if}
	</p>

	<div class="toolbar">
		<button onclick={onback} type="button">{$i18n.core.back}</button>

		<button {...testId(testIds.createSatellite.create)} {disabled} type="submit">
			{$i18n.core.launch}
		</button>
	</div>
</form>
