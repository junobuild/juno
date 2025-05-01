<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();

	let { clients } = $derived(pageViews);

	let { operating_systems } = $derived(clients);

	let { android, ios, linux, macos, others, windows } = $derived(
		operating_systems ?? {
			android: 0,
			ios: 0,
			linux: 0,
			macos: 0,
			others: 0,
			windows: 0
		}
	);
</script>

{#if nonNullish(operating_systems)}
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th> {$i18n.analytics.operating_systems} </th>
					<th> </th>
				</tr>
			</thead>

			<tbody>
				<tr>
					<td>Android</td>
					<td>{android > 0 ? (android * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>iOS</td>
					<td>{ios > 0 ? (ios * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>Windows</td>
					<td>{windows > 0 ? (windows * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>Mac</td>
					<td>{macos > 0 ? (macos * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>Linux</td>
					<td>{linux > 0 ? (linux * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>{$i18n.analytics.others}</td>
					<td>{others > 0 ? (others * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
			</tbody>
		</table>
	</div>
{/if}
