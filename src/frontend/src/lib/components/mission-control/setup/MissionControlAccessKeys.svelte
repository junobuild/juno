<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Principal } from '@icp-sdk/core/principal';
	import type { MissionControlDid } from '$declarations';
	import AccessKeys from '$lib/components/modules/access-keys/AccessKeys.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { listMissionControlControllers } from '$lib/services/access-keys/mission-control.key.list.services';
	import {
		addMissionControlAccessKey,
		removeMissionControlAccessKey
	} from '$lib/services/access-keys/mission-control.key.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type {
		AddAccessKeyResult,
		AddAccessKeyParams,
		AccessKeyIdParam,
		AccessKeyUi
	} from '$lib/types/access-keys';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	const list = (): Promise<[Principal, AccessKeyUi][]> =>
		listMissionControlControllers({ missionControlId, identity: $authIdentity });

	const remove = async (accessKey: AccessKeyIdParam): Promise<AddAccessKeyResult> =>
		await removeMissionControlAccessKey({
			identity: $authIdentity,
			missionControlId,
			...accessKey
		});

	const add = async (accessKey: AddAccessKeyParams): Promise<AddAccessKeyResult> =>
		await addMissionControlAccessKey({
			identity: $authIdentity,
			missionControlId,
			...accessKey
		});

	const pseudoAdminController: MissionControlDid.AccessKey = {
		created_at: 0n,
		updated_at: 0n,
		expires_at: [],
		kind: [],
		metadata: [],
		scope: { Admin: null }
	};

	let extraControllers = $derived<[Principal, MissionControlDid.AccessKey][]>([
		[missionControlId, pseudoAdminController],
		...(nonNullish($authIdentity)
			? [
					[$authIdentity.getPrincipal(), pseudoAdminController] as [
						Principal,
						MissionControlDid.AccessKey
					]
				]
			: [])
	]);
</script>

<AccessKeys
	{add}
	{extraControllers}
	{list}
	{remove}
	segment={{
		label: $i18n.mission_control.title,
		canisterId: missionControlId.toText(),
		segment: 'mission_control'
	}}
/>
