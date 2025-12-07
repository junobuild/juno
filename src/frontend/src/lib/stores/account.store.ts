import type { ConsoleDid } from '$declarations';
import { initCertifiedStore } from '$lib/stores/_certified.store';

export const accountCertifiedStore = initCertifiedStore<ConsoleDid.Account | undefined>();
