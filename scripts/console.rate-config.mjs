#!/usr/bin/env node

import { consoleActorLocal } from './actor.mjs';

const segment = (type) => (type === 'satellite' ? { Satellite: null } : { MissionControl: null });

const updateConfig = async ({ actor, type, config }) => {
	console.log(`Updating rate config ${type} in console.`);

	await actor.update_rate_config(segment(type), config);

	console.log(`Config for ${type} updated.`);
};

(async () => {
	const actor = await consoleActorLocal();

	const config = {
		max_tokens: 100,
		time_per_token_ns: 60000000000n // 1min = 60000000000n
	};

	await updateConfig({ actor, type: 'mission_control', config });
})();
