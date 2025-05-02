<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();

	let { clients } = $derived(pageViews);

	let { devices } = $derived(clients);

	let { mobile, tablet: tabletDid, desktop, laptop: desktopDid, others } = $derived(devices);

	let tablet = $derived(fromNullable(tabletDid));
	let laptop = $derived(fromNullable(desktopDid));
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th> {$i18n.analytics.devices} </th>
				<th class="count"> </th>
			</tr>
		</thead>

		<tbody>
			<tr>
				<td>{$i18n.analytics.mobile}</td>
				<td class="value">{mobile > 0 ? (mobile * 100).toFixed(2) : 0}<small>%</small></td>
			</tr>
			{#if nonNullish(tablet) && tablet > 0}
				<tr>
					<td>{$i18n.analytics.tablet}</td>
					<td class="value">{tablet > 0 ? (tablet * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
			{/if}
			{#if nonNullish(laptop) && laptop > 0}
				<tr>
					<td>{$i18n.analytics.laptop}</td>
					<td class="value">{laptop > 0 ? (laptop * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
			{/if}
			<tr>
				<td>{$i18n.analytics.desktop}</td>
				<td class="value">{desktop > 0 ? (desktop * 100).toFixed(2) : 0}<small>%</small></td>
			</tr>
			{#if others > 0}
				<tr>
					<td>{$i18n.analytics.others}</td>
					<td class="value">{others > 0 ? (others * 100).toFixed(2) : 0}<small>%</small></td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

<style lang="scss">
	.count {
		width: 35%;
	}

	.count,
	.value {
		text-align: right;
	}
</style>
