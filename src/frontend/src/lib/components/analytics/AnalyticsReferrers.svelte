<script lang="ts">
	import type { AnalyticsTop10PageViews } from '$declarations/orbiter/orbiter.did';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/ortbiter';

	export let pageViews: AnalyticsPageViews;

	let top10: AnalyticsTop10PageViews;
	$: ({ top10 } = pageViews);
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
				{#each top10.referrers as [referrer, count]}
					<tr>
						<td>{referrer}</td>
						<td>{count}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style lang="scss">
	.count {
		width: 20%;
	}
</style>
