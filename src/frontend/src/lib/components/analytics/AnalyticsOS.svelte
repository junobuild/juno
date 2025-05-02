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
					<th class="count"> </th>
				</tr>
			</thead>

			<tbody>
				<tr>
					<td>Android</td>
					<td class="value">{android > 0 ? (android * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>iOS</td>
					<td class="value">{ios > 0 ? (ios * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>Windows</td>
					<td class="value">{windows > 0 ? (windows * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>Mac</td>
					<td class="value">{macos > 0 ? (macos * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>Linux</td>
					<td class="value">{linux > 0 ? (linux * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
				<tr>
					<td>{$i18n.analytics.others}</td>
					<td class="value">{others > 0 ? (others * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
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
