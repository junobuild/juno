#!/usr/bin/env node

import {orbiterActorLocal} from './actor.mjs';

const orbiterId = "gl6nx-5maaa-aaaaa-qaaqq-cai";

const analytics = async () => {
	const {get_analytics_page_views} = await orbiterActorLocal(orbiterId);

	const results = await get_analytics_page_views({
		to: [],
		from: [],
		satellite_id: [],
	});

	console.log('Analytics:', results);
};

await analytics();
