<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();

	let { clients } = $derived(pageViews);

	let { devices } = $derived(clients);

	let { mobile, tablet, desktop, laptop } = $derived(devices);
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
				<td>{$i18n.analytics.tablet}</td>
				<td>{tablet > 0 ? (tablet * 100).toFixed(2) : 0}<small>%</small></td>
			</tr>
			{#if nonNullish(laptop) && laptop > 0}
				<tr>
					<td>{$i18n.analytics.laptop}</td>
					<td>{laptop > 0 ? (laptop * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
			{/if}
			<tr>
				<td>{$i18n.analytics.desktop}</td>
				<td>{desktop > 0 ? (desktop * 100).toFixed(2) : 0}<small>%</small></td>
			</tr>
		</tbody>
	</table>
</div>
