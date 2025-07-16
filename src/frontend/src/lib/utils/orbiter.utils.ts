import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import type { PageViewsParams, PageViewsPeriods } from '$lib/types/orbiter';
import { metadataName } from '$lib/utils/metadata.utils';
import { nonNullish } from '@dfinity/utils';
import {
	addDays,
	addHours,
	differenceInHours,
	eachHourOfInterval,
	endOfDay,
	startOfDay
} from 'date-fns';

export const orbiterName = ({ metadata }: Orbiter): string => metadataName(metadata);

export const buildAnalyticsPeriods = ({
	params
}: {
	params: Pick<PageViewsParams, 'from' | 'to' | 'periodicity'>;
}): PageViewsPeriods => {
	const { from, to, periodicity } = params;

	const fromStart = startOfDay(from);

	const end = to ?? addDays(new Date(), 1);
	const endStart = startOfDay(end);

	// We need to cap the periodicity because eachHourOfInterval returns empty if for example the periodicity is a mont, 720h, but there are less hours between the two dates
	const periodEndHours = addHours(fromStart, periodicity);
	const cappedPeriodicity =
		periodEndHours.getTime() > endStart.getTime()
			? differenceInHours(endStart, fromStart)
			: periodicity;

	const hours = eachHourOfInterval(
		{
			start: fromStart,
			end: endStart
		},
		{ step: cappedPeriodicity }
	);

	const periods = [];
	for (let i = 0; i <= hours.length - 2; i++) {
		periods.push({
			from: hours[i],
			to: hours[i + 1]
		});
	}

	const last = periods.pop();

	return [
		...periods,
		...(nonNullish(last)
			? [
					{
						...last,
						to: endOfDay(last.to)
					}
				]
			: [])
	];
};
