import type { CronJobs, CronTab } from '$declarations/observatory/observatory.did';
import { getObservatoryActor } from '$lib/utils/actor.juno.utils';
import { toNullable } from '$lib/utils/did.utils';
import type { Principal } from '@dfinity/principal';

export const getCronTab = async (): Promise<[] | [CronTab]> => {
	const actor = await getObservatoryActor();
	return actor.get_cron_tab();
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
