import type { ArchiveStatuses, CronJobs, CronTab } from '$declarations/observatory/observatory.did';
import { getObservatoryActor } from '$lib/utils/actor.juno.utils';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';

export const getCronTab = async (): Promise<[] | [CronTab]> => {
	const { get_cron_tab } = await getObservatoryActor();
	return get_cron_tab();
};

export const getStatuses = async (): Promise<[] | [ArchiveStatuses]> => {
	const { get_statuses } = await getObservatoryActor();
	return get_statuses();
};

export const setCronTab = async ({
	missionControlId,
	cronTab,
	cron_jobs
}: {
	missionControlId: Principal;
	cronTab: CronTab | undefined;
	cron_jobs: CronJobs;
}): Promise<CronTab> => {
	const actor = await getObservatoryActor();
	return actor.set_cron_tab({
		mission_control_id: missionControlId,
		cron_jobs,
		updated_at: toNullable(cronTab?.updated_at)
	});
};
