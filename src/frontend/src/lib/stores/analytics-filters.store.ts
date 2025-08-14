import type { AnalyticsPeriodicity, PageViewsFilters } from '$lib/types/orbiter';
import { getLocalStorageAnalyticsPeriodicity } from '$lib/utils/local-storage.utils';
import { addWeeks } from 'date-fns';
import { type Readable, writable } from 'svelte/store';

export interface AnalyticsFiltersStore extends Readable<PageViewsFilters> {
	setPeriodicity: (periodicity: AnalyticsPeriodicity) => void;
	setPeriod: (period: Omit<PageViewsFilters, 'periodicity'>) => void;
}

export const initAnalyticsFiltersStore = (): AnalyticsFiltersStore => {
	const { subscribe, update } = writable<PageViewsFilters>({
		...getLocalStorageAnalyticsPeriodicity(),
		from: addWeeks(new Date(), -1)
	});

	return {
		subscribe,

		setPeriodicity(periodicity) {
			update((state) => ({
				...state,
				periodicity
			}));
		},

		setPeriod(period) {
			update((state) => ({
				...state,
				...period
			}));
		}
	};
};

export const analyticsFiltersStore = initAnalyticsFiltersStore();
