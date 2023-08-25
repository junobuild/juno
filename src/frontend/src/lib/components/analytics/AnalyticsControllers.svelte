<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Controller } from '$declarations/mission_control/mission_control.did';
	import Controllers from '$lib/components/controllers/Controllers.svelte';
	import type { SetControllerParams } from '$lib/types/controllers';
	import { listOrbiterControllers } from '$lib/api/orbiter.api';
	import { deleteOrbitersController, setOrbitersController } from '$lib/api/mission-control.api';

	export let orbiterId: Principal;

	const list = (): Promise<[Principal, Controller][]> => listOrbiterControllers({ orbiterId });

	const remove = (params: { missionControlId: Principal; controller: Principal }): Promise<void> =>
		deleteOrbitersController({
			...params,
			orbiterIds: [orbiterId]
		});

	const add = (
		params: {
			missionControlId: Principal;
		} & SetControllerParams
	): Promise<void> =>
		setOrbitersController({
			...params,
			orbiterIds: [orbiterId]
		});
</script>

<div>
	<Controllers {list} {remove} {add} />
</div>

<style lang="scss">
	div {
		margin: var(--padding-8x) 0 0;
	}
</style>
