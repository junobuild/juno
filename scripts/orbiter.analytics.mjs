#!/usr/bin/env node

import { orbiterActorIC } from './actor.mjs';

const orbiterId = '3iier-sqaaa-aaaal-aczaa-cai';

const analytics = async () => {
	const {
		analytics_metrics_page_views,
		analytics_top_10_page_views,
		analytics_devices_page_views,
		instruction_counter
	} = await orbiterActorIC(orbiterId);

	const params = {
		to: [],
		from: [],
		satellite_id: []
	};

	const [metrics, top10, devices] = await Promise.all([
		analytics_metrics_page_views(params),
		analytics_top_10_page_views(params),
		analytics_devices_page_views(params)
	]);

	console.log('Metrics:', metrics);
	console.log('Top10:', top10);
	console.log('Devices:', devices);
};

await analytics();
