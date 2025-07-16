<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { format } from 'date-fns';
	import AnalyticsPeriodicity from '$lib/components/analytics/AnalyticsPeriodicity.svelte';
	import AnalyticsSatellitesPicker from '$lib/components/analytics/AnalyticsSatellitesPicker.svelte';
	import Toolbar from '$lib/components/ui/Toolbar.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { analyticsFiltersStore } from '$lib/stores/analytics-filters.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPeriodicity as AnalyticsPeriodicityType } from '$lib/types/orbiter';

	interface Props {
		loadAnalytics: () => Promise<{ result: 'ok' | 'error' | 'skip' }>;
	}

	let { loadAnalytics }: Props = $props();

	let from = $state(
		nonNullish($analyticsFiltersStore.from) ? format($analyticsFiltersStore.from, 'yyyy-MM-dd') : ''
	);
	let to = $state(
		nonNullish($analyticsFiltersStore.to) ? format($analyticsFiltersStore.to, 'yyyy-MM-dd') : ''
	);

	let loading = $state(false);

	const onChange = () => {
		analyticsFiltersStore.setPeriod({
			from: nonNullish(from) && from !== '' ? new Date(from) : undefined,
			to: nonNullish(to) && to !== '' ? new Date(to) : undefined
		});
	};

	const onPeriodicityChange = (periodicity: AnalyticsPeriodicityType) => {
		analyticsFiltersStore.setPeriodicity(periodicity);
	};

	const applyFilters = async () => {
		loading = true;

		const { result } = await loadAnalytics();

		loading = false;

		if (result === 'error') {
			return;
		}
	};
</script>

<Toolbar>
	{#snippet start()}
		<Value>
			{#snippet label()}
				{$i18n.analytics.satellites}
			{/snippet}
			<AnalyticsSatellitesPicker disabled={loading} />
		</Value>
	{/snippet}

	{#snippet center()}
		<Value ref="from">
			{#snippet label()}
				{$i18n.core.from}
			{/snippet}

			<input
				bind:value={from}
				id="from"
				name="from"
				type="date"
				onchange={onChange}
				disabled={loading}
			/>
		</Value>
	{/snippet}

	{#snippet end()}
		<div class="end">
			<div class="input">
				<Value ref="to">
					{#snippet label()}
						{$i18n.core.to}
					{/snippet}

					<input
						bind:value={to}
						id="to"
						name="to"
						type="date"
						onchange={onChange}
						disabled={loading}
					/>
				</Value>
			</div>

			<AnalyticsPeriodicity selectPeriodicity={onPeriodicityChange} disabled={loading} />
		</div>
	{/snippet}
</Toolbar>

<div class="toolbar" class:loading>
	{#if !loading}
		<button type="button" onclick={applyFilters}>{$i18n.core.apply}</button>
	{/if}
</div>

<style lang="scss">
	.toolbar:not(.loading) {
		margin: 0 0 var(--padding-4x);
	}

	.end {
		display: flex;
		align-items: flex-end;

		gap: var(--padding-2x);

		.input {
			width: 100%;
		}
	}
</style>
