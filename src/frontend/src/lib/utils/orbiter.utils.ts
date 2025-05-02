import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import type { PageViewsParams, PageViewsPeriods } from '$lib/types/orbiter';
import { metadataName } from '$lib/utils/metadata.utils';
import { eachHourOfInterval } from 'date-fns';

export const orbiterName = ({ metadata }: Orbiter): string => metadataName(metadata);

export const buildAnalyticsPeriods = ({
	params
}: {
	params: Pick<PageViewsParams, 'from' | 'to' | 'periodicity'>;
}): PageViewsPeriods => {
	const { from, to, periodicity } = params;

	const days = eachHourOfInterval(
		{
			start: from,
			end: to ?? new Date()
		},
		{ step: periodicity }
	);

	const periods = [];
	for (let i = 0; i <= days.length - 2; i++) {
		periods.push({
			from: days[i],
			to: days[i + 1]
		});
	}

	return periods;
};
