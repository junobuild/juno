<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import type { Controller } from '$declarations/satellite/satellite.did';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		visible?: boolean;
		selectedController: [Principal, Controller | undefined] | undefined;
		remove: (params: {
			missionControlId: MissionControlId;
			controller: Principal;
		}) => Promise<void>;
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

		if (isNullish($missionControlIdDerived)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		busy.start();

		try {
			await remove({
				missionControlId: $missionControlIdDerived,
				controller: selectedController[0]
			});
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.controllers_delete,
				detail: err
			});
		}

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
