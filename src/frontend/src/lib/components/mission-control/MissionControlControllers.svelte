<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import {
		deleteMissionControlController,
		listMissionControlControllers
	} from '$lib/api/mission-control.api';
	import { authStore } from '$lib/stores/auth.store';
	import { nonNullish } from '$lib/utils/utils';
	import type { Controller } from '$declarations/mission_control/mission_control.did';
	import Controllers from '$lib/components/controllers/Controllers.svelte';

	export let missionControlId: Principal;

	let controllers: Principal[] = [];

	const list = (): Promise<[Principal, Controller][]> =>
		listMissionControlControllers({ missionControlId });

	const remove = (params: { missionControlId: Principal; controller: Principal }): Promise<void> =>
		deleteMissionControlController(params);

	let extraControllers: [Principal, Controller | undefined][] = [
		[missionControlId, undefined],
		...(nonNullish($authStore.identity)
			? [[$authStore.identity.getPrincipal(), undefined] as [Principal, Controller | undefined]]
			: [])
	];
</script>

<Controllers {list} {remove} {extraControllers} />
