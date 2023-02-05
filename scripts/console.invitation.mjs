#!/usr/bin/env node

import { nanoid } from 'nanoid';
import { consoleActorIC } from './actor.mjs';

(async () => {
	const actor = await consoleActorIC();

	const invitationCode = nanoid();

	await actor.add_invitation_code(invitationCode);

	console.log('Invitation code:', invitationCode);
})();
