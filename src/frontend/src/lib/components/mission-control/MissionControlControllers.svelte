<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import {
		listMissionControlControllers,
		removeMissionControlController
	} from '$lib/api/mission-control.api';
	import Controllers from '$lib/components/canister/Controllers.svelte';

	export let missionControlId: Principal;

	let controllers: Principal[] = [];

	const list = (): Promise<Principal[]> => listMissionControlControllers({ missionControlId });

	const remove = (params: { missionControlId: Principal; controller: Principal }) =>
		removeMissionControlController(params);
</script>

<Controllers {list} {remove} />
