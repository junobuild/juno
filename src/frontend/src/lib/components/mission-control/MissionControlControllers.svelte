<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import {
		listMissionControlControllers,
		removeMissionControlController
	} from '$lib/api/mission-control.api';
	import Controllers from '$lib/components/canister/Controllers.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { nonNullish } from '$lib/utils/utils';
	import type { Controller } from '$declarations/mission_control/mission_control.did';

	export let missionControlId: Principal;

	let controllers: Principal[] = [];

	const list = (): Promise<[Principal, Controller][]> =>
		listMissionControlControllers({ missionControlId });

	const remove = (params: { missionControlId: Principal; controller: Principal }) =>
		removeMissionControlController(params);

	let extraControllers: [Principal, Controllers | undefined][] = [
		[missionControlId, undefined],
		...(nonNullish($authStore.identity) ? [[$authStore.identity.getPrincipal(), undefined]] : [])
	];
</script>

<Controllers {list} {remove} {extraControllers} />
