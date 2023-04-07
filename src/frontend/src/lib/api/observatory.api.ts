import type { CronJobs, CronTab } from '$declarations/observatory/observatory.did';
import { getObservatoryActor } from '$lib/utils/actor.utils';
import { toNullable } from '$lib/utils/did.utils';
import type { Principal } from '@dfinity/principal';

export const getCronTab = async ({
	missionControlId
}: {
	missionControlId: Principal;
}): Promise<[] | [CronTab]> => {
	const actor = await getObservatoryActor();
	return actor.get_cron_tab(missionControlId);
};

export const setCronTab = async ({
	missionControlId,
	cronTab,
	cron_jobs
}: {
	missionControlId: Principal;
	cronTab: CronTab | undefined;
	cron_jobs: CronJobs;
}): Promise<void> => {
	const actor = await getObservatoryActor();
	await actor.set_cron_tab({
		mission_control_id: missionControlId,
		cron_jobs,
		updated_at: toNullable(cronTab?.updated_at)
	});
};
