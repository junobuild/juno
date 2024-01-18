<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Controller } from '$declarations/mission_control/mission_control.did';
	import Controllers from '$lib/components/controllers/Controllers.svelte';
	import type { SetControllerParams } from '$lib/types/controllers';
	import { listOrbiterControllers } from '$lib/api/orbiter.api';
	import { deleteOrbitersController, setOrbitersController } from '$lib/api/mission-control.api';
	import { i18n } from '$lib/stores/i18n.store';
	import { authStore } from '$lib/stores/auth.store';

	export let orbiterId: Principal;

	const list = (): Promise<[Principal, Controller][]> =>
		listOrbiterControllers({ orbiterId, identity: $authStore.identity });

	const remove = (params: { missionControlId: Principal; controller: Principal }): Promise<void> =>
		deleteOrbitersController({
			...params,
			orbiterIds: [orbiterId],
			identity: $authStore.identity
		});

	const add = (
		params: {
			missionControlId: Principal;
		} & SetControllerParams
	): Promise<void> =>
		setOrbitersController({
			...params,
			orbiterIds: [orbiterId],
			identity: $authStore.identity
		});
</script>

<div>
	<Controllers {list} {remove} {add} segment={{ label: $i18n.analytics.orbiter, id: orbiterId }} />
</div>

<style lang="scss">
	div {
		margin: var(--padding-8x) 0 0;
	}
</style>
