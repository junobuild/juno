<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import type { MissionControlDid } from '$declarations';
	import {
		deleteSatellitesController,
		setSatellitesController
	} from '$lib/api/mission-control.api';
	import { listControllers } from '$lib/api/satellites.api';
	import AccessKeys from '$lib/components/modules/access-keys/AccessKeys.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { addAccessKey, removeAccessKey } from '$lib/services/access-keys/access-keys.services';
	import { addSatellitesAccessKey } from '$lib/services/access-keys/satellites.key.add.services';
	import { removeSatellitesAccessKey } from '$lib/services/access-keys/satellites.key.remove.services';
	import {
		addUfoController,
		listUfoControllers,
		removeUfoController
	} from '$lib/services/access-keys/ufo.key.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type {
		AddAccessKeyResult,
		AddAccessKeyParams,
		AccessKeyWithDevFn,
		AccessKeyWithMissionControlFn,
		AccessKeyIdParam,
		AccessKeyUi
	} from '$lib/types/access-keys';
	import type { Satellite } from '$lib/types/satellite';
	import type { Ufo } from '$lib/types/ufo';

	interface Props {
		ufo: Ufo;
	}

	let { ufo }: Props = $props();

	const list = (): Promise<[Principal, AccessKeyUi][]> =>
		listUfoControllers({ ufoId: ufo.ufo_id, identity: $authIdentity });

	const remove = async (accessKey: AccessKeyIdParam): Promise<AddAccessKeyResult> => {
		return await removeUfoController({
			identity: $authIdentity,
			ufoId: ufo.ufo_id,
			accessKey
		});
	};

	const add = async (accessKey: AddAccessKeyParams): Promise<AddAccessKeyResult> => {
		return await addUfoController({
			identity: $authIdentity,
			accessKey,
			ufoId: ufo.ufo_id
		});
	};
</script>

<AccessKeys
	{add}
	{list}
	{remove}
	segment={{
		label: $i18n.ufo.title,
		canisterId: ufo.ufo_id.toText(),
		segment: 'ufo'
	}}
/>
