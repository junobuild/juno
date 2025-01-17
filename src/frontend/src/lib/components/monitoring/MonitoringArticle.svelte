<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Monitoring } from '$declarations/mission_control/mission_control.did';
	import Canister from '$lib/components/canister/Canister.svelte';
	import Chart from '$lib/components/charts/Chart.svelte';
	import IconClockUpdate from '$lib/components/icons/IconClockUpdate.svelte';
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import CanisterMonitoringLoader from '$lib/components/loaders/CanisterMonitoringLoader.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData, CanisterMonitoringData, Segment } from '$lib/types/canister';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { formatToRelativeTime } from '$lib/utils/date.utils';
	import { fromNullishNullable } from '$lib/utils/did.utils';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		children: Snippet;
		monitoring: Monitoring | undefined;
		canisterId: Principal;
		segment: Segment;
		segmentLabel: string;
	}

	let { children, monitoring, segment, canisterId, segmentLabel }: Props = $props();

	let enabled = $derived(fromNullishNullable(monitoring?.cycles)?.enabled === true);

	let monitoringData = $state<CanisterMonitoringData | undefined>(undefined);
	let canisterData = $state<CanisterData | undefined>(undefined);

	let chartsData = $derived(monitoringData?.chartsData ?? []);

	let lastExecutionTime = $derived(monitoringData?.metadata?.lastExecutionTime);
	let lastDepositCyclesTime = $derived(monitoringData?.metadata?.latestDepositedCycles?.timestamp);
	let lastDepositCyclesAmount = $derived(monitoringData?.metadata?.latestDepositedCycles?.amount);

	const openModal = () => {
		emit({
			message: 'junoModal',
			detail: {
				type: 'show_monitoring_details',
				detail: {
					segment: {
						canisterId: canisterId.toText(),
						segment,
						segmentLabel
					},
					monitoring
				}
			}
		});
	};
</script>

<Canister {canisterId} {segment} display={false} bind:data={canisterData} />

<CanisterMonitoringLoader {segment} {canisterId} bind:data={monitoringData}>
	<button onclick={openModal} class="article monitoring">
		<span class="segment">
			{@render children()}
		</span>

		<span class="canister"><Canister {segment} {canisterId} row={true} /></span>

		{#if enabled}
			<span class="chart-container" in:fade>
				<Chart
					{chartsData}
					axisWithText={false}
					padding={{ top: 0, right: 0, bottom: 0, left: 0 }}
				/>
			</span>

			<span class="info">
				{#if nonNullish(lastExecutionTime)}
					<span in:fade title={$i18n.monitoring.last_status_check}
						><IconClockUpdate /> <span>{formatToRelativeTime(lastExecutionTime)}</span></span
					>
				{/if}
				{#if nonNullish(lastDepositCyclesTime) && nonNullish(lastDepositCyclesAmount)}
					<span in:fade title={$i18n.monitoring.last_top_up}
						><IconRefresh size="18px" />
						<span
							>{formatToRelativeTime(lastDepositCyclesTime)} with {formatTCycles(
								lastDepositCyclesAmount
							)}T <small>Cycles</small></span
						></span
					>
				{/if}
			</span>
		{:else}
			<span class="info">{$i18n.monitoring.auto_refill_disabled}</span>
		{/if}
	</button>
</CanisterMonitoringLoader>

<style lang="scss">
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/shadow';

	.segment {
		display: flex;
		align-items: center;
		gap: var(--padding);

		:global(svg) {
			min-width: 24px;
		}

		:global(span) {
			@include text.truncate;
		}
	}

	.info {
		display: flex;
		flex-direction: column;
		gap: var(--padding);

		font-size: var(--font-size-small);

		color: var(--value-color);

		> span {
			display: flex;
			align-items: flex-start;
			gap: var(--padding);

			span {
				margin: 0;

				&::first-letter {
					text-transform: uppercase;
				}
			}
		}
	}

	button.article.monitoring {
		display: flex;
		flex-direction: column;
		align-items: flex-start;

		row-gap: var(--padding-1_5x);

		padding: var(--padding-2x) var(--padding-4x);

		@include media.min-width(large) {
			display: grid;
			grid-column: 1 / 13;
			grid-template-columns: 18% 350px auto auto;
			grid-template-rows: 60px;
			grid-gap: var(--padding-8x);
			align-items: center;
		}
	}

	.chart-container {
		min-height: 60px;
		height: 100%;
		width: 100px;
		fill: var(--value-color);

		@include shadow.strong-card;

		overflow: hidden;

		display: none;

		@include media.min-width(large) {
			display: block;
		}
	}

	.canister {
		margin: var(--padding-4x) 0 0;

		@include media.min-width(large) {
			margin: 0;
		}
	}
</style>
