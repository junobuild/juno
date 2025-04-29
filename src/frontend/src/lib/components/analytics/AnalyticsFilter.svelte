<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { addMonths, format } from 'date-fns';
	import { slide, fade } from 'svelte/transition';
	import { afterNavigate } from '$app/navigation';
	import AnalyticsSatellitesPicker from '$lib/components/analytics/AnalyticsSatellitesPicker.svelte';
	import AnalyticsToolbar from '$lib/components/analytics/AnalyticsToolbar.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type {PageViewsOptionPeriod, AnalyticsPeriodicity} from '$lib/types/ortbiter';
	import AnalyticsPeriodicity from "$lib/components/analytics/AnalyticsPeriodicity.svelte";

	interface Props {
		selectPeriod: (period: PageViewsOptionPeriod) => void;
		selectPeriodicity: (periodicity: AnalyticsPeriodicity) => void;
		loadAnalytics: () => Promise<void>;
	}

	let { selectPeriod, selectPeriodicity, loadAnalytics }: Props = $props();

	let from = $state(format(addMonths(new Date(), -1), 'yyyy-MM-dd'));
	let to = $state('');

	let dirty = $state(false);
	let status = $state<'idle' | 'loading' | 'loaded'>('idle');
	let loading = $derived(status === 'loading');

	const onChange = () => {
		selectPeriod({
			from: nonNullish(from) && from !== '' ? new Date(from) : undefined,
			to: nonNullish(to) && to !== '' ? new Date(to) : undefined
		});

		dirty = true;
	};

	const onPeriodicityChange = (periodicity: AnalyticsPeriodicity) => {
		selectPeriodicity(periodicity);

		dirty = true;
	}

	afterNavigate(() => (dirty = true));

	const applyFilters = async () => {
		status = 'loading';

		await loadAnalytics();

		status = 'loaded';
		setTimeout(() => {
			status = 'idle';
			dirty = false;
		}, 1500);
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

					<input bind:value={to} id="to" name="to" type="date" onchange={onChange} disabled={loading} />
				</Value>
			</div>

			<AnalyticsPeriodicity selectPeriodicity={onPeriodicityChange} />
		</div>
	{/snippet}
</AnalyticsToolbar>

{#if dirty}
	<div class="toolbar" transition:slide>
		{#if status !== 'idle'}
			<div class="loading">
				{#if status === 'loading'}
					<SpinnerParagraph>{$i18n.analytics.loading}</SpinnerParagraph>
				{:else if status === 'loaded'}
					<span class="loaded" in:fade>{$i18n.analytics.analytics_updated}</span>
				{/if}
			</div>
		{:else if !loading}
			<button type="button" onclick={applyFilters}>{$i18n.core.apply}</button>
		{/if}
	</div>
{/if}

<style lang="scss">
	.toolbar {
		margin: 0 0 var(--padding-4x);
	}

	.loading {
		display: block;
		padding: 0 0 calc(var(--padding-1_5x) - 1px);
	}

	.loaded {
		display: inline-block;
		font-size: var(--font-size-small);
		padding: var(--padding-3x) 0 0;
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
