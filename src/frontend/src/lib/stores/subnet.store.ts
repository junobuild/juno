import { initCanisterStore } from '$lib/stores/_canister.store';
import type { Subnet } from '$lib/types/subnet';
import type { Option } from '$lib/types/utils';

export type SubnetData = Option<Subnet>;
export const subnetStore = initCanisterStore<SubnetData>();
