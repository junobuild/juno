import { initCanisterStore } from '$lib/stores/_canister.store';
import type { Snapshots } from '$lib/types/progress-snapshot';

export type SnapshotData = Snapshots;
export const snapshotStore = initCanisterStore<SnapshotData>();
