<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import SatellitesPicker from '$lib/components/satellites/SatellitesPicker.svelte';
	import { createEventDispatcher } from 'svelte';
	import { nonNullish } from '@dfinity/utils';
	import type { PageViewsPeriod } from '$lib/types/ortbiter';
	import { addMonths, format } from 'date-fns';
	import AnalyticsToolbar from '$lib/components/analytics/AnalyticsToolbar.svelte';

	let from = format(addMonths(new Date(), -1), 'yyyy-MM-dd');
	let to = '';

	const dispatch = createEventDispatcher();

	const onChange = () =>
		dispatch('junoPeriod', {
			from: nonNullish(from) && from !== '' ? new Date(from) : undefined,
			to: nonNullish(to) && to !== '' ? new Date(to) : undefined
		} as PageViewsPeriod);
</script>

<AnalyticsToolbar>
	<Value slot="start">
		<svelte:fragment slot="label">{$i18n.analytics.satellites}</svelte:fragment>
		<SatellitesPicker />
	</Value>

	<Value ref="from" slot="center">
		<svelte:fragment slot="label">{$i18n.core.from}</svelte:fragment>

		<input bind:value={from} id="from" name="from" type="date" on:change={onChange} />
	</Value>

	<Value ref="to" slot="end">
		<svelte:fragment slot="label">{$i18n.core.to}</svelte:fragment>

		<input bind:value={to} id="to" name="to" type="date" on:change={onChange} />
	</Value>
</AnalyticsToolbar>
