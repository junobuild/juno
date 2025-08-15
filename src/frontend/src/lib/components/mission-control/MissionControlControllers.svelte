<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import type { Controller } from '$declarations/mission_control/mission_control.did';
	import {
		deleteMissionControlController,
		listMissionControlControllers,
		setMissionControlController
	} from '$lib/api/mission-control.api';
	import Controllers from '$lib/components/controllers/Controllers.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SetControllerParams } from '$lib/types/controllers';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	const list = (): Promise<[Principal, Controller][]> =>
		listMissionControlControllers({ missionControlId, identity: $authStore.identity });

	const remove = (params: {
		missionControlId: MissionControlId;
		controller: Principal;
	}): Promise<void> => deleteMissionControlController({ ...params, identity: $authStore.identity });

	const add = (
		params: {
			missionControlId: MissionControlId;
		} & SetControllerParams
	): Promise<void> => setMissionControlController({ ...params, identity: $authStore.identity });

	const pseudoAdminController: Controller = {
		created_at: 0n,
		updated_at: 0n,
		expires_at: [],
		metadata: [],
		scope: { Admin: null }
	};

	let extraControllers = $derived<[Principal, Controller][]>([
		[missionControlId, pseudoAdminController],
		...(nonNullish($authStore.identity)
			? [[$authStore.identity.getPrincipal(), pseudoAdminController] as [Principal, Controller]]
			: [])
	]);
</script>

<Controllers
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
