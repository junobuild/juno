#!/usr/bin/env node

import { observatoryActorLocal } from './actor.mjs';

(async () => {
	const actor = await observatoryActorLocal();

	const result = await actor.list_last_statuses();

	console.log('Statuses:', result);
})();
