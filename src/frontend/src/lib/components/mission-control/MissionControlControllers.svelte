<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import {
		deleteMissionControlController,
		listMissionControlControllers,
		setMissionControlController
	} from '$lib/api/mission-control.api';
	import { authStore } from '$lib/stores/auth.store';
	import { nonNullish } from '@dfinity/utils';
	import type { Controller } from '$declarations/mission_control/mission_control.did';
	import Controllers from '$lib/components/controllers/Controllers.svelte';
	import type { SetControllerParams } from '$lib/types/controllers';
	import { i18n } from '$lib/stores/i18n.store';

	export let missionControlId: Principal;

	const list = (): Promise<[Principal, Controller][]> =>
		listMissionControlControllers({ missionControlId, identity: $authStore.identity });

	const remove = (params: { missionControlId: Principal; controller: Principal }): Promise<void> =>
		deleteMissionControlController({ ...params, identity: $authStore.identity });

	const add = (
		params: {
			missionControlId: Principal;
		} & SetControllerParams
	): Promise<void> => setMissionControlController({ ...params, identity: $authStore.identity });

	let extraControllers: [Principal, Controller | undefined][] = [
		[missionControlId, undefined],
		...(nonNullish($authStore.identity)
			? [[$authStore.identity.getPrincipal(), undefined] as [Principal, Controller | undefined]]
			: [])
	];
</script>

<Controllers
	{list}
	{remove}
	{add}
	{extraControllers}
	segment={{ label: $i18n.mission_control.title, id: missionControlId }}
/>
