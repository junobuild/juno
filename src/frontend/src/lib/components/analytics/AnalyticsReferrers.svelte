<script lang="ts">
	import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';
	import { i18n } from '$lib/stores/i18n.store';
	import { nonNullish } from '@dfinity/utils';
	import { fromNullable } from '@dfinity/utils';

	export let pageViews: [AnalyticKey, PageView][] = [];

	let referrers: Record<string, number> = {};
	$: referrers = pageViews
		.filter(
			([_, { referrer }]) => nonNullish(fromNullable(referrer)) && fromNullable(referrer) !== ''
		)
		.reduce(
			(acc, [_, { referrer }]) => {
				const ref = fromNullable(referrer) as string;

				let host: string;
				try {
					const url = new URL(ref);
					host = url.host;
				} catch (err: unknown) {
					host = ref;
				}

				return {
					...acc,
					[host]: (acc[host] ?? 0) + 1
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
					<th> {$i18n.analytics.referrers} </th>
					<th class="count"> {$i18n.analytics.count} </th>
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

<style lang="scss">
	.count {
		width: 20%;
	}
</style>
