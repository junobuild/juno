import type { ArchiveStatuses, CronJobs, CronTab } from '$declarations/observatory/observatory.did';
import { getObservatoryActor } from '$lib/api/actors/actor.juno.api';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Principal } from '@dfinity/principal';

export const getCronTab = async (identity: OptionIdentity): Promise<[] | [CronTab]> => {
	const { get_cron_tab } = await getObservatoryActor(identity);
	return get_cron_tab();
};

export const getStatuses = async (identity: OptionIdentity): Promise<[] | [ArchiveStatuses]> => {
	const { get_statuses } = await getObservatoryActor(identity);
	return get_statuses();
};

export const setCronTab = async ({
	missionControlId,
	cronTab,
	cron_jobs,
	identity
}: {
	missionControlId: Principal;
	cronTab: CronTab | undefined;
	cron_jobs: CronJobs;
	identity: OptionIdentity;
}): Promise<CronTab> => {
	const { set_cron_tab } = await getObservatoryActor(identity);
	return set_cron_tab({
		mission_control_id: missionControlId,
		cron_jobs,
		version: cronTab?.version ?? []
	});
};
