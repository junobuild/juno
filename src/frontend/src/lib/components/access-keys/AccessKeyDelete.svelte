<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import type { Principal } from '@icp-sdk/core/principal';
	import type { SatelliteDid } from '$declarations';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { busy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import type { AccessKeyIdParam, AddAccessKeyResult } from '$lib/types/access-keys';

	interface Props {
		visible?: boolean;
		selectedController: [Principal, SatelliteDid.Controller | undefined] | undefined;
		remove: (params: AccessKeyIdParam) => Promise<AddAccessKeyResult>;
		load: () => Promise<void>;
	}

	let {
		visible = $bindable(false),
		selectedController = $bindable(),
		remove,
		load
	}: Props = $props();

	const deleteController = async () => {
		if (isNullish(selectedController)) {
			toasts.error({
				text: $i18n.errors.controllers_no_selection
			});
			return;
		}

		busy.start();

		await remove({
			accessKeyId: selectedController[0]
		});

		close();

		await load();

		busy.stop();
	};

	const close = () => {
		selectedController = undefined;
		visible = false;
	};
</script>

<Confirmation bind:visible on:junoYes={deleteController} on:junoNo={close}>
	{#snippet title()}
		{$i18n.controllers.delete_question}
	{/snippet}

	<Value>
		{#snippet label()}
			{$i18n.controllers.controller_id}
		{/snippet}
		<p>{selectedController?.[0].toText() ?? ''}</p>
	</Value>
</Confirmation>
