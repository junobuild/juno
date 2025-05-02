<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';
	import { formatCompactNumber } from '$lib/utils/number.utils';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();

	let { top10 } = $derived(pageViews);
</script>

{#if top10.referrers.length > 0}
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th> {$i18n.analytics.referrers} </th>
					<th class="count"> {$i18n.analytics.count} </th>
				</tr>
			</thead>

			<tbody>
				{#each top10.referrers as [referrer, count] (referrer)}
					<tr>
						<td>{referrer}</td>
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
