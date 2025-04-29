<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { addMonths, format } from 'date-fns';
	import AnalyticsSatellitesPicker from '$lib/components/analytics/AnalyticsSatellitesPicker.svelte';
	import AnalyticsToolbar from '$lib/components/analytics/AnalyticsToolbar.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { PageViewsOptionPeriod } from '$lib/types/ortbiter';

	interface Props {
		selectPeriod: (period: PageViewsOptionPeriod) => void;
	}

	let { selectPeriod }: Props = $props();

	let from = $state(format(addMonths(new Date(), -1), 'yyyy-MM-dd'));
	let to = $state('');

	const onChange = () =>
		selectPeriod({
			from: nonNullish(from) && from !== '' ? new Date(from) : undefined,
			to: nonNullish(to) && to !== '' ? new Date(to) : undefined
		});
</script>

<AnalyticsToolbar>
	{#snippet start()}
		<Value>
			{#snippet label()}
				{$i18n.analytics.satellites}
			{/snippet}
			<AnalyticsSatellitesPicker />
		</Value>
	{/snippet}

	{#snippet center()}
		<Value ref="from">
			{#snippet label()}
				{$i18n.core.from}
			{/snippet}

			<input bind:value={from} id="from" name="from" type="date" onchange={onChange} />
		</Value>
	{/snippet}

	{#snippet end()}
		<Value ref="to">
			{#snippet label()}
				{$i18n.core.to}
			{/snippet}

			<input bind:value={to} id="to" name="to" type="date" onchange={onChange} />
		</Value>
	{/snippet}
</AnalyticsToolbar>
