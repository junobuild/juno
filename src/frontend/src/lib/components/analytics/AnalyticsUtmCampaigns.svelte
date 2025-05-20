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

	let utmCampaigns = $derived(fromNullable(top10.utm_campaigns));
</script>

{#if nonNullish(utmCampaigns) && utmCampaigns.length > 0}
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th> {$i18n.analytics.utm_campaigns} </th>
					<th class="count"> {$i18n.analytics.count} </th>
				</tr>
			</thead>

			<tbody>
				{#each utmCampaigns as [utmCampaign, count] (utmCampaign)}
					<tr>
						<td>{utmCampaign}</td>
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
