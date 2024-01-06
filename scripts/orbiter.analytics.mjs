#!/usr/bin/env node

import { orbiterActorIC } from './actor.mjs';

const orbiterId = '3iier-sqaaa-aaaal-aczaa-cai';

const analytics = async () => {
	const {
		get_page_views_analytics_metrics,
		get_page_views_analytics_top_10,
		get_page_views_analytics_devices,
		get_track_events_analytics
	} = await orbiterActorIC(orbiterId);

	const params = {
		to: [],
		from: [],
		satellite_id: []
	};

	const [metrics, top10, devices, trackEvents] = await Promise.all([
		get_page_views_analytics_metrics(params),
		get_page_views_analytics_top_10(params),
		get_page_views_analytics_devices(params),
		get_track_events_analytics(params)
	]);

	console.log('Metrics:', metrics);
	console.log('Top10:', top10);
	console.log('Devices:', devices);
	console.log('Track events:', trackEvents);
};

await analytics();
