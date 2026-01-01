<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import type { MissionControlDid } from '$declarations';
	import { deleteOrbitersController, setOrbitersController } from '$lib/api/mission-control.api';
	import { listOrbiterControllers } from '$lib/api/orbiter.api';
	import Controllers from '$lib/components/access-keys/AccessKeys.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { SetControllerParams } from '$lib/types/controllers';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		orbiterId: Principal;
	}

	let { orbiterId }: Props = $props();

	const list = (): Promise<[Principal, MissionControlDid.Controller][]> =>
		listOrbiterControllers({ orbiterId, identity: $authIdentity });

	const remove = (params: {
		missionControlId: MissionControlId;
		controller: Principal;
	}): Promise<void> =>
		deleteOrbitersController({
			...params,
			orbiterIds: [orbiterId],
			identity: $authIdentity
		});

	const add = (
		params: {
			missionControlId: MissionControlId;
		} & SetControllerParams
	): Promise<void> =>
		setOrbitersController({
			...params,
			orbiterIds: [orbiterId],
			identity: $authIdentity
		});
</script>

<Controllers
	{add}
	{list}
	{remove}
	segment={{ label: $i18n.analytics.orbiter, canisterId: orbiterId.toText(), segment: 'orbiter' }}
/>
