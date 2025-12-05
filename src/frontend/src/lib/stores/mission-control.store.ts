import type { ConsoleDid, MissionControlDid } from '$declarations';
import { initCertifiedStore } from '$lib/stores/_certified.store';
import { initUncertifiedStore } from '$lib/stores/_uncertified.store';

export const accountCertifiedStore = initCertifiedStore<ConsoleDid.Account>();

export const missionControlUserUncertifiedStore = initUncertifiedStore<MissionControlDid.User>();

export const missionControlSettingsUncertifiedStore = initUncertifiedStore<
	MissionControlDid.MissionControlSettings | undefined
>();
