<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import type { MissionControlDid } from '$declarations';
	import { deleteOrbitersController, setOrbitersController } from '$lib/api/mission-control.api';
	import { listOrbiterControllers } from '$lib/api/orbiter.api';
	import AccessKeys from '$lib/components/modules/access-keys/AccessKeys.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { addAccessKey, removeAccessKey } from '$lib/services/access-keys/access-keys.services';
	import { addOrbiterAccessKey } from '$lib/services/access-keys/orbiter.key.add.services';
	import { removeOrbiterAccessKey } from '$lib/services/access-keys/orbiter.key.remove.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type {
		AddAccessKeyResult,
		AddAccessKeyParams,
		AccessKeyWithDevFn,
		AccessKeyWithMissionControlFn,
		AccessKeyIdParam
	} from '$lib/types/access-keys';

	interface Props {
		orbiterId: Principal;
	}

	let { orbiterId }: Props = $props();

	const list = (): Promise<[Principal, MissionControlDid.Controller][]> =>
		listOrbiterControllers({ orbiterId, identity: $authIdentity });

	const remove = async (accessKey: AccessKeyIdParam): Promise<AddAccessKeyResult> => {
		const orbiterIds = [orbiterId];

		const removeAccessKeyWithMissionControlFn: AccessKeyWithMissionControlFn = async (params) => {
			await deleteOrbitersController({
				...params,
				...accessKey,
				orbiterIds
			});
		};

		const removeAccessKeyWithDevFn: AccessKeyWithDevFn = async (params) => {
			await removeOrbiterAccessKey({
				...accessKey,
				...params,
				orbiterIds
			});
		};

		return await removeAccessKey({
			identity: $authIdentity,
			missionControlId: $missionControlId,
			accessKey,
			removeAccessKeyWithMissionControlFn,
			removeAccessKeyWithDevFn
		});
	};

	const add = async (accessKey: AddAccessKeyParams): Promise<AddAccessKeyResult> => {
		const orbiterIds = [orbiterId];

		const addAccessKeyWithMissionControlFn: AccessKeyWithMissionControlFn = async (params) => {
			await setOrbitersController({
				...accessKey,
				...params,
				orbiterIds
			});
		};

		const addAccessKeyWithDevFn: AccessKeyWithDevFn = async (params) => {
			await addOrbiterAccessKey({
				...accessKey,
				...params,
				orbiterIds
			});
		};

		return await addAccessKey({
			identity: $authIdentity,
			missionControlId: $missionControlId,
			accessKey,
			addAccessKeyWithMissionControlFn,
			addAccessKeyWithDevFn
		});
	};
</script>

<AccessKeys
	{add}
	{list}
	{remove}
	segment={{ label: $i18n.analytics.orbiter, canisterId: orbiterId.toText(), segment: 'orbiter' }}
/>
