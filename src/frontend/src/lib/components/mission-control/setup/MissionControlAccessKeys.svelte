<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Principal } from '@icp-sdk/core/principal';
	import type { MissionControlDid } from '$declarations';
	import {
		deleteMissionControlController,
		listMissionControlControllers,
		setMissionControlController
	} from '$lib/api/mission-control.api';
	import AccessKeys from '$lib/components/access-keys/AccessKeys.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { addAccessKey } from '$lib/services/access-keys/key.add.services';
	import { addMissionControlAccessKey } from '$lib/services/access-keys/mission-control.key.add.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type {
		AddAccessKeyResult,
		AddAccessKeyParams,
		AccessKeyWithMissionControlFn
	} from '$lib/types/access-keys';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	const list = (): Promise<[Principal, MissionControlDid.Controller][]> =>
		listMissionControlControllers({ missionControlId, identity: $authIdentity });

	const remove = (params: {
		missionControlId: MissionControlId;
		controller: Principal;
	}): Promise<void> => deleteMissionControlController({ ...params, identity: $authIdentity });

	const add = async (accessKey: AddAccessKeyParams): Promise<AddAccessKeyResult> =>
		await addMissionControlAccessKey({
			identity: $authIdentity,
			missionControlId,
			...accessKey
		});

	const pseudoAdminController: MissionControlDid.Controller = {
		created_at: 0n,
		updated_at: 0n,
		expires_at: [],
		metadata: [],
		scope: { Admin: null }
	};

	let extraControllers = $derived<[Principal, MissionControlDid.Controller][]>([
		[missionControlId, pseudoAdminController],
		...(nonNullish($authIdentity)
			? [
					[$authIdentity.getPrincipal(), pseudoAdminController] as [
						Principal,
						MissionControlDid.Controller
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
