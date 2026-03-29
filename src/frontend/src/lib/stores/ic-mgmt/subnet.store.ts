import { initCanisterStore } from '$lib/stores/_canister.store';
import type { Subnet } from '$lib/types/subnet';
import type { Nullish } from '@dfinity/zod-schemas';

export type SubnetData = Nullish<Subnet>;
export const subnetStore = initCanisterStore<SubnetData>();
