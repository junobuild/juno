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
		saveAsDefaultStrategy: boolean;
		missionControlMinCycles: bigint | undefined;
		missionControlFundCycles: bigint | undefined;
		missionControl: { monitored: boolean; strategy: CyclesMonitoringStrategy | undefined };
		userEmail: Option<string>;
		reuseStrategy: CyclesMonitoringStrategy | undefined;
		onback: () => void;
		onsubmit: ($event: MouseEvent | TouchEvent) => Promise<void>;
	}

	// eslint-disable-next-line svelte/no-unused-props
	let {
		selectedSatellites,
		selectedOrbiters,
		minCycles,
		fundCycles,
		saveAsDefaultStrategy,
		missionControlMinCycles,
		missionControlFundCycles,
		missionControl,
		userEmail,
		reuseStrategy,
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
				<MonitoringSelectedModules {selectedOrbiters} {selectedSatellites} />

				<Value>
					{#snippet label()}
						{$i18n.monitoring.remaining_threshold}
					{/snippet}

					<p>{formatTCycles(reuseStrategy?.BelowThreshold.min_cycles ?? minCycles ?? 0n)}</p>
				</Value>

				<Value>
					{#snippet label()}
						{$i18n.monitoring.top_up_amount}
					{/snippet}

					<p>{formatTCycles(reuseStrategy?.BelowThreshold.fund_cycles ?? fundCycles ?? 0n)}</p>
				</Value>

				{#if saveAsDefaultStrategy}
					<Value>
						{#snippet label()}
							{$i18n.monitoring.default_strategy}
						{/snippet}

						<p>{$i18n.monitoring.strategy_for_modules}</p>
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

							<p>
								{formatTCycles(
									reuseStrategy?.BelowThreshold.min_cycles ??
										missionControlMinCycles ??
										minCycles ??
										0n
								)}
							</p>
						</Value>

						<Value>
							{#snippet label()}
								{$i18n.monitoring.top_up_amount}
							{/snippet}

							<p class="no-margin">
								{formatTCycles(
									reuseStrategy?.BelowThreshold.fund_cycles ??
										missionControlFundCycles ??
										fundCycles ??
										0n
								)}
							</p>
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
