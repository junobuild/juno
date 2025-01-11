<script lang="ts">
	import { Ed25519KeyIdentity } from '@dfinity/identity';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import { run, preventDefault } from 'svelte/legacy';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { REVOKED_CONTROLLERS } from '$lib/constants/constants';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { SetControllerScope } from '$lib/types/controllers';
	import type { JunoModalCreateControllerDetail, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
	}

	let { detail }: Props = $props();

	let { add, load, segment } = $derived(detail as JunoModalCreateControllerDetail);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');

	let controllerId = $state('');
	let scope: SetControllerScope = $state('write');
	let identity: string | undefined = $state();

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
		if (isNullish($missionControlIdDerived)) {
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
		step = 'in_progress';

		try {
			await add({
				missionControlId: $missionControlIdDerived,
				controllerId: controller,
				profile: undefined,
				scope
			});

			await load();

			step = 'ready';
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.controllers_delete,
				detail: err
			});

			step = 'error';
		}

		wizardBusy.stop();
	};

	let action = $state('generate');

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		action, (() => (controllerId = ''))();
	});
</script>

<Modal on:junoClose>
	{#if step === 'ready'}
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
						{#snippet label()}
							{segment.label}
						{/snippet}
						<Identifier identifier={segment.canisterId} shorten={false} small={false} />
					</Value>
				</div>

				<div>
					<Value>
						{#snippet label()}
							{$i18n.controllers.new_controller_id}
						{/snippet}
						<Identifier identifier={controllerId} shorten={false} small={false} />
					</Value>
				</div>

				{#if action === 'generate' && nonNullish(identity)}
					<div>
						<Value>
							{#snippet label()}
								{$i18n.controllers.new_controller_secret} <IconWarning />
							{/snippet}
							<Identifier identifier={identity} />
						</Value>
					</div>
				{/if}

				<button class="close" onclick={close}>{$i18n.core.close}</button>
			</div>
		</div>
	{:else if step === 'in_progress'}
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

		<form class="content" onsubmit={preventDefault(addController)}>
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
				autocomplete="off"
				data-1p-ignore
			/>

			<div class="scope">
				<Value>
					{#snippet label()}
						{$i18n.controllers.scope}
					{/snippet}
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
