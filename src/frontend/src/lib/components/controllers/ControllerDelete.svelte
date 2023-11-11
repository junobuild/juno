<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { busy } from '$lib/stores/busy.store';
	import type { Controller } from '$declarations/satellite/satellite.did';
	import Value from '$lib/components/ui/Value.svelte';
	import Confirmation from '$lib/components/core/Confirmation.svelte';

	export let visible = false;
	export let selectedController: [Principal, Controller | undefined] | undefined;
	export let remove: (params: {
		missionControlId: Principal;
		controller: Principal;
	}) => Promise<void>;
	export let load: () => Promise<void>;

	const deleteController = async () => {
		if (isNullish(selectedController)) {
			toasts.error({
				text: $i18n.errors.controllers_no_selection
			});
			return;
		}

		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		busy.start();

		try {
			await remove({
				missionControlId: $missionControlStore,
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
	<svelte:fragment slot="title">{$i18n.controllers.delete_question}</svelte:fragment>

	<Value>
		<svelte:fragment slot="label">{$i18n.controllers.controller_id}</svelte:fragment>
		<p>{selectedController?.[0].toText() ?? ''}</p>
	</Value>
</Confirmation>
