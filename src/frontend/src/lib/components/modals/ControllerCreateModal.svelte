<script lang="ts">
	import { Ed25519KeyIdentity } from '@dfinity/identity';
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { REVOKED_CONTROLLERS } from '$lib/constants/constants';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import type { SetControllerParams, SetControllerScope } from '$lib/types/controllers';
	import type { JunoModalCreateControllerDetail, JunoModalDetail } from '$lib/types/modal';

	export let detail: JunoModalDetail;

	let add: (
		params: {
			missionControlId: Principal;
		} & SetControllerParams
	) => Promise<void>;
	let load: () => Promise<void>;
	let segment: CanisterSegmentWithLabel;

	$: ({ add, load, segment } = detail as JunoModalCreateControllerDetail);

	let steps: 'init' | 'in_progress' | 'ready' | 'error' = 'init';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');

	let controllerId = '';
	let scope: SetControllerScope = 'write';
	let identity: string | undefined;

	const initController = (): string | undefined => {
		if (action === 'add') {
			return controllerId;
		}

		const key = Ed25519KeyIdentity.generate();

		identity = btoa(JSON.stringify({ token: key.toJSON() }));
		controllerId = key.getPrincipal().toText();

		return controllerId;
	};

	const addController = async () => {
		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		const controller = initController();

		if (isNullish(controller) || controller === '') {
			toasts.error({
				text: $i18n.errors.controller_invalid
			});
			return;
		}

		if (REVOKED_CONTROLLERS.includes(controller)) {
			toasts.error({
				text: 'The controller has been revoked for security reason!'
			});
			return;
		}

		wizardBusy.start();
		steps = 'in_progress';

		try {
			await add({
				missionControlId: $missionControlStore,
				controllerId: controller,
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

		wizardBusy.stop();
	};

	let action = 'generate';

	$: action, (() => (controllerId = ''))();
</script>

<Modal on:junoClose>
	{#if steps === 'ready'}
		<div class="msg">
			<h2>{$i18n.controllers.controller_added}</h2>

			<p>
				{#if action === 'add'}
					{$i18n.controllers.controller_added_text}
				{:else}
					{$i18n.controllers.controller_generated_text}
				{/if}
			</p>

			<div class="summary">
				<div>
					<Value>
						<svelte:fragment slot="label">{segment.label}</svelte:fragment>
						<Identifier identifier={segment.canisterId} shorten={false} small={false} />
					</Value>
				</div>

				<div>
					<Value>
						<svelte:fragment slot="label">{$i18n.controllers.new_controller_id}</svelte:fragment>
						<Identifier identifier={controllerId} shorten={false} small={false} />
					</Value>
				</div>

				{#if action === 'generate' && nonNullish(identity)}
					<div>
						<Value>
							<svelte:fragment slot="label"
								>{$i18n.controllers.new_controller_secret} <IconWarning /></svelte:fragment
							>
							<Identifier identifier={identity} />
						</Value>
					</div>
				{/if}

				<button class="close" on:click={close}>{$i18n.core.close}</button>
			</div>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>
				{#if action === 'add'}
					{$i18n.controllers.adding_controller}
				{:else}
					{$i18n.controllers.generating_controller}
				{/if}
			</p>
		</SpinnerModal>
	{:else}
		<h2>{$i18n.controllers.add_a_controller}</h2>

		<p>{$i18n.controllers.add_intro}</p>

		<form class="content" on:submit|preventDefault={addController}>
			<div>
				<label>
					<input type="radio" bind:group={action} name="action" value="generate" />
					<span>{$i18n.controllers.generate}</span>
				</label>
			</div>

			<label>
				<input type="radio" bind:group={action} name="action" value="add" />
				<span>{$i18n.controllers.manually}</span>
			</label>

			<input
				bind:value={controllerId}
				aria-label={$i18n.controllers.controller_id_placeholder}
				name="controller-id"
				placeholder={$i18n.controllers.controller_id_placeholder}
				type="text"
				required={action === 'add'}
				disabled={action === 'generate'}
			/>

			<div class="scope">
				<Value>
					<svelte:fragment slot="label">{$i18n.controllers.scope}</svelte:fragment>
					<select name="scope" bind:value={scope}>
						<option value="write">{$i18n.controllers.write}</option>
						<option value="admin">{$i18n.controllers.admin}</option>
					</select>
				</Value>
			</div>

			<button
				type="submit"
				disabled={action === 'add' && (isNullish(controllerId) || controllerId === '')}
			>
				{$i18n.core.submit}
			</button>
		</form>
	{/if}
</Modal>

<style lang="scss">
	select {
		width: fit-content;
	}

	button {
		margin-top: var(--padding-2x);
	}

	.scope {
		padding: var(--padding) 0 0;
	}

	.summary {
		display: flex;
		flex-direction: column;
	}

	.close {
		align-self: center;
	}
</style>
