#!/usr/bin/env node

import { nanoid } from 'nanoid';
import { consoleActorLocal } from './actor.mjs';

(async () => {
	const actor = await consoleActorLocal();

	const invitationCode = nanoid();

	await actor.add_invitation_code(invitationCode);

	console.log('Invitation code:', invitationCode);
})();
