<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();

	let { clients } = $derived(pageViews);

	let { browsers } = $derived(clients);

	let { safari, opera, others, firefox, chrome } = $derived(
		browsers ?? {
			safari: 0,
			opera: 0,
			others: 0,
			firefox: 0,
			chrome: 0
		}
	);
</script>

{#if nonNullish(browsers)}
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th> {$i18n.analytics.browsers} </th>
					<th> </th>
				</tr>
			</thead>

			<tbody>
				<tr>
					<td>Chrome</td>
					<td>{chrome > 0 ? (chrome * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>Safari</td>
					<td>{safari > 0 ? (safari * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>Firefox</td>
					<td>{firefox > 0 ? (firefox * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>Opera</td>
					<td>{opera > 0 ? (opera * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>{$i18n.analytics.others}</td>
					<td>{others > 0 ? (others * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
			</tbody>
		</table>
	</div>
{/if}
