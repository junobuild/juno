<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Controller } from '$declarations/mission_control/mission_control.did';
	import Controllers from '$lib/components/controllers/Controllers.svelte';
	import type { SetControllerParams } from '$lib/types/controllers';
	import {
		deleteOrbiterController,
		listOrbiterControllers,
		setOrbiterController
	} from '$lib/api/orbiter.api';

	export let orbiterId: Principal;

	let controllers: Principal[] = [];

	const list = (): Promise<[Principal, Controller][]> => listOrbiterControllers({ orbiterId });

	const remove = ({
		controller
	}: {
		missionControlId: Principal;
		controller: Principal;
	}): Promise<void> => deleteOrbiterController({ controller, orbiterId });

	const add = ({
		missionControlId,
		...rest
	}: {
		missionControlId: Principal;
	} & SetControllerParams): Promise<void> => setOrbiterController({ ...rest, orbiterId });
</script>

<Controllers {list} {remove} {add} />
