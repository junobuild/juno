<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { isNullish } from '$lib/utils/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import Popover from '$lib/components/ui/Popover.svelte';
	import type { Controller } from '$declarations/satellite/satellite.did';
	import Value from '$lib/components/ui/Value.svelte';

	export let visible = false;
	export let selectedController: [Principal, Controller] | undefined;
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

<Popover bind:visible center={true}>
	<div class="content">
		<h3>{$i18n.controllers.delete_question}</h3>

		<Value>
			<svelte:fragment slot="label">{$i18n.controllers.controller_id}</svelte:fragment>
			<p>{selectedController?.[0].toText() ?? ''}</p>
		</Value>

		<button type="button" on:click|stopPropagation={close} disabled={$isBusy}>
			{$i18n.core.no}
		</button>

		<button type="button" on:click|stopPropagation={deleteController} disabled={$isBusy}>
			{$i18n.core.yes}
		</button>
	</div>
</Popover>

<style lang="scss">
	.content {
		padding: var(--padding-2x);
	}

	h3 {
		margin-bottom: var(--padding-2x);
	}
</style>
