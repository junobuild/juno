<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';
	import { formatCompactNumber, formatNumber } from '$lib/utils/number.utils';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();

	let { top10 } = $derived(pageViews);
</script>

{#if top10.pages.length > 0}
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th> {$i18n.analytics.pages} </th>
					<th class="count"> {$i18n.analytics.count} </th>
				</tr>
			</thead>

			<tbody>
				{#each top10.pages as [pages, count], index (index)}
					<tr>
						<td>{pages}</td>
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
