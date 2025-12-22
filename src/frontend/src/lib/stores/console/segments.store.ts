import type { ConsoleDid } from '$declarations';
import { initUncertifiedStore } from '$lib/stores/_uncertified.store';

export const segmentsUncertifiedStore =
	initUncertifiedStore<[ConsoleDid.SegmentKey, ConsoleDid.Segment][]>();
