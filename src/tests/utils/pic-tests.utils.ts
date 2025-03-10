import { PocketIc } from '@hadronous/pic';

// Prevent Error: Canister lxzze-o7777-77777-aaaaa-cai is rate limited because it executed too many instructions in the previous install_code messages. Please retry installation after several minutes.
export const tick = (pic: PocketIc): Promise<void> => pic.tick(100);
