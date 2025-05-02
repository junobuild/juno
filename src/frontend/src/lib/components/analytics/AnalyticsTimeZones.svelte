<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';
	import { formatCompactNumber } from '$lib/utils/number.utils';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();

	let { top10 } = $derived(pageViews);

	let timeZones = $derived(fromNullable(top10.time_zones));
</script>

{#if nonNullish(timeZones) && timeZones.length > 0}
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th> {$i18n.analytics.time_zones} </th>
					<th class="count"> {$i18n.analytics.count} </th>
				</tr>
			</thead>

			<tbody>
				{#each timeZones as [timeZone, count] (timeZone)}
					<tr>
						<td>{timeZone}</td>
						<td class="value">{formatCompactNumber(count)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style lang="scss">
	.count {
		width: 35%;
	}

	.count,
	.value {
		text-align: right;
	}
</style>
