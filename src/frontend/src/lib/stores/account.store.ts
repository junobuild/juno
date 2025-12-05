import { initCertifiedStore } from '$lib/stores/_certified.store';
import type { ConsoleDid } from '$declarations';

export const accountCertifiedStore = initCertifiedStore<ConsoleDid.Account>();