<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish, notEmptyString } from '@dfinity/utils';
	import type {
		CyclesMonitoringStrategy,
		Orbiter,
		Satellite
	} from '$declarations/mission_control/mission_control.did';
	import MonitoringSelectedModules from '$lib/components/monitoring/MonitoringSelectedModules.svelte';
	import MonitoringStepReview from '$lib/components/monitoring/MonitoringStepReview.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Option } from '$lib/types/utils';
	import { formatTCycles } from '$lib/utils/cycles.utils';

	interface Props {
		selectedSatellites: [Principal, Satellite][];
		selectedOrbiters: [Principal, Orbiter][];
		minCycles: bigint | undefined;
		fundCycles: bigint | undefined;
		useAsDefaultStrategy: boolean;
		missionControlMinCycles: bigint | undefined;
		missionControlFundCycles: bigint | undefined;
		missionControl: { monitored: boolean; strategy: CyclesMonitoringStrategy | undefined };
		userEmail: Option<string>;
		onback: () => void;
		onsubmit: ($event: MouseEvent | TouchEvent) => Promise<void>;
	}

	let {
		selectedSatellites,
		selectedOrbiters,
		minCycles,
		fundCycles,
		useAsDefaultStrategy,
		missionControlMinCycles,
		missionControlFundCycles,
		missionControl,
		userEmail,
		onback,
		onsubmit
	}: Props = $props();

	let hasEmail = $derived(nonNullish(userEmail) && notEmptyString(userEmail));
</script>

<MonitoringStepReview {onback} {onsubmit}>
	<h2>{$i18n.monitoring.review_strategy}</h2>

	<p>{$i18n.monitoring.review_info}</p>

	<div class="container">
		<div class="card-container with-title">
			<span class="title">{$i18n.monitoring.modules}</span>

			<div class="content">
				<MonitoringSelectedModules {selectedSatellites} {selectedOrbiters} />

				<Value>
					{#snippet label()}
						{$i18n.monitoring.remaining_threshold}
					{/snippet}

					<p>{formatTCycles(minCycles ?? 0n)}</p>
				</Value>

				<Value>
					{#snippet label()}
						{$i18n.monitoring.top_up_amount}
					{/snippet}

					<p>{formatTCycles(fundCycles ?? 0n)}</p>
				</Value>

				{#if useAsDefaultStrategy}
					<Value>
						{#snippet label()}
							{$i18n.monitoring.default_strategy}
						{/snippet}

						<p>{$i18n.monitoring.configuration_for_modules}</p>
					</Value>
				{/if}
			</div>
		</div>

		<div>
			{#if !missionControl.monitored || (nonNullish(missionControlFundCycles) && nonNullish(missionControlMinCycles))}
				<div class="card-container with-title">
					<span class="title">{$i18n.mission_control.title}</span>

					<div class="content">
						<Value>
							{#snippet label()}
								{$i18n.monitoring.remaining_threshold}
							{/snippet}

							<p>{formatTCycles(missionControlMinCycles ?? minCycles ?? 0n)}</p>
						</Value>

						<Value>
							{#snippet label()}
								{$i18n.monitoring.top_up_amount}
							{/snippet}

							<p class="no-margin">{formatTCycles(missionControlFundCycles ?? fundCycles ?? 0n)}</p>
						</Value>
					</div>
				</div>
			{/if}

			{#if hasEmail}
				<div class="card-container with-title">
					<span class="title">{$i18n.monitoring.email_notifications}</span>

					<div class="content">
						<Value>
							{#snippet label()}
								{$i18n.core.email_address}
							{/snippet}

							<p>{userEmail ?? ''}</p>
						</Value>
					</div>
				</div>
			{/if}
		</div>
	</div>
</MonitoringStepReview>

<style lang="scss">
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/grid';

	.container {
		margin: var(--padding-4x) 0;

		@include media.min-width(large) {
			@include grid.two-columns;
		}
	}

	.no-margin {
		margin: 0;
	}
</style>
