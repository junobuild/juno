<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsWebVitalsPerformanceMetrics } from '$declarations/orbiter/orbiter.did';
	import { formatNumber } from '$lib/utils/number.utils';

	export let performanceMetrics: AnalyticsWebVitalsPerformanceMetrics;

	let cls: number;
	let fcp: number;
	let inp: number;
	let lcp: number;
	let ttfb: number;

	$: ({ cls, fcp, inp, lcp, ttfb } = performanceMetrics);

	type Rating = 'good' | 'needs_improvement' | 'poor';

	// https://github.com/GoogleChrome/web-vitals/blob/9b932519b16f72328c6d8e9814b811f1bc1a0bb5/src/lib/bindReporter.ts#L19
	const getRating = ({
		value,
		thresholds: [improve, poor]
	}: {
		value: number;
		thresholds: [number, number];
	}): Rating => {
		if (value > poor) {
			return 'poor';
		}
		if (value > improve) {
			return 'needs_improvement';
		}
		return 'good';
	};

	// https://github.com/GoogleChrome/web-vitals/blob/9b932519b16f72328c6d8e9814b811f1bc1a0bb5/src/onCLS.ts#L28
	// https://web.dev/articles/cls#what_is_a_good_cls_score
	let clsRating: Rating;
	$: clsRating = getRating({ value: cls, thresholds: [0.1, 0.25] });

	// https://github.com/GoogleChrome/web-vitals/blob/9b932519b16f72328c6d8e9814b811f1bc1a0bb5/src/onFCP.ts#L28
	// https://web.dev/articles/fcp#what_is_a_good_fcp_score
	let fcpRating: Rating;
	$: fcpRating = getRating({ value: fcp, thresholds: [1800, 3000] });

	// https://github.com/GoogleChrome/web-vitals/blob/9b932519b16f72328c6d8e9814b811f1bc1a0bb5/src/onINP.ts#L35C55-L35C63
	// https://web.dev/articles/inp#what_is_a_good_inp_score
	let inpRating: Rating;
	$: inpRating = getRating({ value: inp, thresholds: [200, 500] });

	// https://github.com/GoogleChrome/web-vitals/blob/9b932519b16f72328c6d8e9814b811f1bc1a0bb5/src/onLCP.ts#L31
	// https://web.dev/articles/lcp#what_is_a_good_lcp_score
	let lcpRating: Rating;
	$: lcpRating = getRating({ value: lcp, thresholds: [2500, 4000] });

	// https://web.dev/articles/ttfb#what_is_a_good_ttfb_score
	// https://github.com/GoogleChrome/web-vitals/blob/9b932519b16f72328c6d8e9814b811f1bc1a0bb5/src/onTTFB.ts#L26C56-L26C65
	let ttfbRating: Rating;
	$: ttfbRating = getRating({ value: ttfb, thresholds: [800, 1800] });
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="description"> {$i18n.analytics.web_vitals} </th>
				<th class="score"> {$i18n.analytics.score} </th>
				<th> {$i18n.analytics.rating} </th>
			</tr>
		</thead>

		<tbody>
			<tr>
				<td>{@html $i18n.analytics.ttfb}</td>
				<td class="score">{formatNumber(ttfb)}</td>
				<td>{$i18n.analytics[ttfbRating]}</td>
			</tr>

			<tr>
				<td>{@html $i18n.analytics.fcp}</td>
				<td class="score">{formatNumber(fcp)}</td>
				<td>{$i18n.analytics[fcpRating]}</td>
			</tr>

			<tr>
				<td>{@html $i18n.analytics.lcp}</td>
				<td class="score">{formatNumber(lcp)}</td>
				<td>{$i18n.analytics[lcpRating]}</td>
			</tr>

			<tr>
				<td>{@html $i18n.analytics.cls}</td>
				<td class="score">{formatNumber(cls)}</td>
				<td>{$i18n.analytics[clsRating]}</td>
			</tr>

			<tr>
				<td>{@html $i18n.analytics.inp}</td>
				<td class="score">{formatNumber(inp)}</td>
				<td>{$i18n.analytics[inpRating]}</td>
			</tr>
		</tbody>
	</table>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.description {
		width: 50%;
	}

	.score {
		display: none;

		width: 20%;

		@include media.min-width(medium) {
			display: table-cell;
			vertical-align: middle;
		}
	}
</style>
