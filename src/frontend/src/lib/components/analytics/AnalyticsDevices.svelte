<script lang="ts">
	import type { AnalyticsDevicesPageViews } from '$declarations/orbiter/orbiter.did';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/ortbiter';

	export let pageViews: AnalyticsPageViews;

	let devices: AnalyticsDevicesPageViews;
	$: ({ devices } = pageViews);

	let desktop: number;
	let others: number;
	let mobile: number;
	$: ({ desktop, mobile, others } = devices);
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th> {$i18n.analytics.devices} </th>
				<th> </th>
			</tr>
		</thead>

		<tbody>
			<tr>
				<td>{$i18n.analytics.mobile}</td>
				<td>{mobile > 0 ? (mobile * 100).toFixed(2) : 0}<small>%</small></td>
			</tr>
			<tr>
				<td>{$i18n.analytics.desktop}</td>
				<td>{desktop > 0 ? (desktop * 100).toFixed(2) : 0}<small>%</small></td>
			</tr>
			<tr>
				<td>{$i18n.analytics.others}</td>
				<td>{others > 0 ? (others * 100).toFixed(2) : 0}<small>%</small></td>
			</tr>
		</tbody>
	</table>
</div>
