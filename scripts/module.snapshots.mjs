import { encodeSnapshotId, ICManagementCanister } from '@dfinity/ic-management';
import { icAgent, localAgent } from './actor.mjs';
import { targetMainnet } from './utils.mjs';

const fnAgent = targetMainnet() ? icAgent : localAgent;
const agent = await fnAgent();

export const listSnapshots = async ({ canisterId }) => {
	const { listCanisterSnapshots } = ICManagementCanister.create({
		agent
	});

	const snapshots = await listCanisterSnapshots({ canisterId });

	if (snapshots.length === 0) {
		console.log('No snapshots found.');
		return;
	}

	console.table(
		snapshots.map((snapshot) => ({
			...snapshot,
			id: `0x${encodeSnapshotId(snapshot.id)}`
		}))
	);
};
