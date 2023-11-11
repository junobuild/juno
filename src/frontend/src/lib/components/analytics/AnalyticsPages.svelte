<script lang="ts">
	import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';
	import { i18n } from '$lib/stores/i18n.store';

	export let pageViews: [AnalyticKey, PageView][] = [];

	let referrers: Record<string, number> = {};
	$: referrers = pageViews.reduce(
		(acc, [_, { href }]) => {
			let pages: string;
			try {
				const { pathname } = new URL(href);
				pages = pathname;
			} catch (err: unknown) {
				pages = href;
			}

			return {
				...acc,
				[pages]: (acc[pages] ?? 0) + 1
			};
		},
		{} as Record<string, number>
	);

	let entries: [string, number][] = [];
	$: entries = Object.entries(referrers)
		.slice(0, 10)
		.sort(([_a, countA], [_b, countB]) => countB - countA);
</script>

{#if entries.length > 0}
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th> {$i18n.analytics.pages} </th>
					<th> {$i18n.analytics.count} </th>
				</tr>
			</thead>

			<tbody>
				{#each entries as [referrer, count]}
					<tr>
						<td>{referrer}</td>
						<td>{count}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
