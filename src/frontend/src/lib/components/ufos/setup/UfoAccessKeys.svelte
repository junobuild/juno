<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import AccessKeys from '$lib/components/modules/access-keys/AccessKeys.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import {
		addUfoController,
		listUfoControllers,
		removeUfoController
	} from '$lib/services/access-keys/ufo.key.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type {
		AddAccessKeyResult,
		AddAccessKeyParams,
		AccessKeyIdParam,
		AccessKeyUi
	} from '$lib/types/access-keys';
	import type { Ufo } from '$lib/types/ufo';

	interface Props {
		ufo: Ufo;
	}

	let { ufo }: Props = $props();

	const list = (): Promise<[Principal, AccessKeyUi][]> =>
		listUfoControllers({ ufoId: ufo.ufo_id, identity: $authIdentity });

	const remove = async (accessKey: AccessKeyIdParam): Promise<AddAccessKeyResult> =>
		await removeUfoController({
			identity: $authIdentity,
			ufoId: ufo.ufo_id,
			accessKey
		});

	const add = async (accessKey: AddAccessKeyParams): Promise<AddAccessKeyResult> =>
		await addUfoController({
			identity: $authIdentity,
			accessKey,
			ufoId: ufo.ufo_id
		});
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
