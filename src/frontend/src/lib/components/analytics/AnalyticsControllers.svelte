<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Controller } from '$declarations/mission_control/mission_control.did';
	import { deleteOrbitersController, setOrbitersController } from '$lib/api/mission-control.api';
	import { listOrbiterControllers } from '$lib/api/orbiter.api';
	import Controllers from '$lib/components/controllers/Controllers.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SetControllerParams } from '$lib/types/controllers';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		orbiterId: Principal;
	}

	let { orbiterId }: Props = $props();

	const list = (): Promise<[Principal, Controller][]> =>
		listOrbiterControllers({ orbiterId, identity: $authStore.identity });

	const remove = (params: {
		missionControlId: MissionControlId;
		controller: Principal;
	}): Promise<void> =>
		deleteOrbitersController({
			...params,
			orbiterIds: [orbiterId],
			identity: $authStore.identity
		});

	const add = (
		params: {
			missionControlId: MissionControlId;
		} & SetControllerParams
	): Promise<void> =>
		setOrbitersController({
			...params,
			orbiterIds: [orbiterId],
			identity: $authStore.identity
		});
</script>

<Controllers
	{list}
	{remove}
	{add}
	segment={{ label: $i18n.analytics.orbiter, canisterId: orbiterId.toText(), segment: 'orbiter' }}
/>
