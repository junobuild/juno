#!/usr/bin/env node

import { observatoryActorLocal } from './actor.mjs';

const filterSegmentStatus = ({ segmentStatus, cron_jobs }) => {
	// If there was an error we want to inform
	if ('Err' in segmentStatus) {
		return true;
	}

	const { Ok: status } = segmentStatus;

	return status.status.cycles < cron_jobs.statuses.cycles_threshold;
};

const filterStatuses = ({ statuses, cron_jobs }) => {
	// If there was an error we want to inform
	if ('Err' in statuses) {
		return true;
	}

	const {
		Ok: { mission_control, satellites }
	} = statuses;

	// Mission control needs to be reported
	if (filterSegmentStatus({ segmentStatus: mission_control, cron_jobs })) {
		return true;
	}

	const satellite = (satellites[0] ?? []).find((satellite) =>
		filterSegmentStatus({ segmentStatus: satellite, cron_jobs })
	);

	return satellite !== undefined;
};

const collect = async () => {
	const actor = await observatoryActorLocal();
	const statuses = await actor.list_last_statuses();

	console.log('Statuses:', statuses.filter(filterStatuses));
};

await collect();
