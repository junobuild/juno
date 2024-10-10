#!/usr/bin/env node

import { nanoid } from 'nanoid';
import { consoleActorLocal } from './actor.mjs';

const actor = await consoleActorLocal();

const invitationCode = nanoid();

await actor.add_invitation_code(invitationCode);

console.log('🏷️ Invitation code:', invitationCode);
console.log('🔗 Redeem URL:', `https://console.juno.build/join?invite=${invitationCode}`);
