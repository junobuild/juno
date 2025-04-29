<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { addMonths, format } from 'date-fns';
	import { slide } from 'svelte/transition';
	import { afterNavigate } from '$app/navigation';
	import AnalyticsPeriodicity from '$lib/components/analytics/AnalyticsPeriodicity.svelte';
	import AnalyticsSatellitesPicker from '$lib/components/analytics/AnalyticsSatellitesPicker.svelte';
	import AnalyticsToolbar from '$lib/components/analytics/AnalyticsToolbar.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type {
		PageViewsOptionPeriod,
		AnalyticsPeriodicity as AnalyticsPeriodicityType
	} from '$lib/types/ortbiter';

	interface Props {
		selectPeriod: (period: PageViewsOptionPeriod) => void;
		selectPeriodicity: (periodicity: AnalyticsPeriodicityType) => void;
		loadAnalytics: () => Promise<{ result: 'ok' | 'error' | 'skip' }>;
	}

	let { selectPeriod, selectPeriodicity, loadAnalytics }: Props = $props();

	let from = $state(format(addMonths(new Date(), -1), 'yyyy-MM-dd'));
	let to = $state('');

	let dirty = $state(false);
	let loading = $state(false);

	const onChange = () => {
		selectPeriod({
			from: nonNullish(from) && from !== '' ? new Date(from) : undefined,
			to: nonNullish(to) && to !== '' ? new Date(to) : undefined
		});

		dirty = true;
	};

	const onPeriodicityChange = (periodicity: AnalyticsPeriodicityType) => {
		selectPeriodicity(periodicity);

		dirty = true;
	};

	afterNavigate(() => (dirty = true));

	const applyFilters = async () => {
		loading = true;

		const { result } = await loadAnalytics();

		loading = false;

		if (result === 'error') {
			return;
		}

		dirty = false;
	};
</script>

<AnalyticsToolbar>
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
</AnalyticsToolbar>

{#if dirty}
	<div class="toolbar" class:loading transition:slide>
		{#if !loading}
			<button type="button" onclick={applyFilters}>{$i18n.core.apply}</button>
		{/if}
	</div>
{/if}

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
