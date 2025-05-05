import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import type { PageViewsParams, PageViewsPeriods } from '$lib/types/orbiter';
import { metadataName } from '$lib/utils/metadata.utils';
import { addHours, differenceInHours, eachHourOfInterval } from 'date-fns';

export const orbiterName = ({ metadata }: Orbiter): string => metadataName(metadata);

export const buildAnalyticsPeriods = ({
	params
}: {
	params: Pick<PageViewsParams, 'from' | 'to' | 'periodicity'>;
}): PageViewsPeriods => {
	const { from, to, periodicity } = params;

	const end = to ?? new Date();

	// We need to cap the periodicity because eachHourOfInterval returns empty if for example the periodicity is a mont, 720h, but there are less hours between the two dates
	const periodEndHours = addHours(from, periodicity);
	const cappedPeriodicity =
		periodEndHours.getTime() > end.getTime() ? differenceInHours(end, from) : periodicity;

	const hours = eachHourOfInterval(
		{
			start: from,
			end: to ?? new Date()
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

	return periods;
};
