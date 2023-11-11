<script lang="ts">
	import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';
	import { fromNullable, isNullish } from '@dfinity/utils';
	import { isAndroid, isAndroidTablet, isIPhone } from '$lib/utils/device.utils';
	import { i18n } from '$lib/stores/i18n.store';

	export let pageViews: [AnalyticKey, PageView][] = [];

	let total: number;
	$: total = pageViews.length;

	type Devices = {
		mobile: number;
		desktop: number;
		others: number;
	};

	let devices: Devices;
	$: devices = pageViews.reduce(
		(acc, [_, { user_agent }]) => {
			const userAgent = fromNullable(user_agent);

			if (isNullish(userAgent)) {
				return {
					...acc,
					other: acc.others + 1
				};
			}

			const mobile = isIPhone(userAgent) || (isAndroid(userAgent) && !isAndroidTablet(userAgent));

			if (mobile) {
				return {
					...acc,
					mobile: acc.mobile + 1
				};
			}

			return {
				...acc,
				desktop: acc.desktop + 1
			};
		},
		{
			mobile: 0,
			desktop: 0,
			others: 0
		}
	);
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
				<td>{total > 0 ? (devices.mobile * 100) / total : 0}<small>%</small></td>
			</tr>
			<tr>
				<td>{$i18n.analytics.desktop}</td>
				<td>{total > 0 ? (devices.desktop * 100) / total : 0}<small>%</small></td>
			</tr>
			<tr>
				<td>{$i18n.analytics.others}</td>
				<td>{total > 0 ? (devices.others * 100) / total : 0}<small>%</small></td>
			</tr>
		</tbody>
	</table>
</div>
