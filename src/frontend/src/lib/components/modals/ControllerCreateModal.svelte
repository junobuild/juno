<script lang="ts">
	import type { JunoModalCreateControllerDetail, JunoModalDetail } from '$lib/types/modal';
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { Principal } from '@dfinity/principal';
	import type { SetControllerParams, SetControllerScope } from '$lib/types/controllers';
	import { isNullish } from '$lib/utils/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { toasts } from '$lib/stores/toasts.store';
	import Value from '$lib/components/ui/Value.svelte';
	import { wizardBusy } from '$lib/stores/busy.store';

	export let detail: JunoModalDetail;

	let add: (
		params: {
			missionControlId: Principal;
		} & SetControllerParams
	) => Promise<void>;
	let load: () => Promise<void>;
	let action: 'add' | 'generate';

	$: ({ add, load, action } = detail as JunoModalCreateControllerDetail);

	let steps: 'init' | 'in_progress' | 'ready' | 'error' = 'init';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');

	let controllerId = '';
	let scope: SetControllerScope = 'write';

	const addController = async () => {
		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		wizardBusy.start();
		steps = 'in_progress';

		try {
			await add({
				missionControlId: $missionControlStore,
				controllerId,
				profile: undefined,
				scope
			});

			await load();

			steps = 'ready';
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.controllers_delete,
				detail: err
			});

			steps = 'error';
		}
	};
</script>

<Modal on:junoClose>
	{#if steps === 'ready'}
		<div class="msg">
			<p>{$i18n.controllers.controller_added}</p>
			<button on:click={close}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.core.in_progress}</p>
		</SpinnerModal>
	{:else if action === 'generate'}{:else}
		<h2>{$i18n.controllers.add_a_controller}</h2>

		<p>{$i18n.controllers.add_intro}</p>

		<form class="content" on:submit|preventDefault={addController}>
			<div>
				<Value>
					<svelte:fragment slot="label">{$i18n.controllers.controller_id}</svelte:fragment>
					<input
						bind:value={controllerId}
						aria-label={$i18n.controllers.controller_id_placeholder}
						name="controller-id"
						placeholder={$i18n.controllers.controller_id_placeholder}
						type="text"
						required
					/>
				</Value>
			</div>

			<div>
				<Value>
					<svelte:fragment slot="label">{$i18n.controllers.scope}</svelte:fragment>
					<select name="scope" bind:value={scope}>
						<option value="write">{$i18n.controllers.write}</option>
						<option value="admin">{$i18n.controllers.admin}</option>
					</select>
				</Value>
			</div>

			<button type="submit">
				{$i18n.core.submit}
			</button>
		</form>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	select {
		width: fit-content;
	}

	button {
		margin-top: var(--padding-2x);
	}

	.msg {
		@include overlay.message;
	}
</style>
