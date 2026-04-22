<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
	import { untrack } from 'svelte';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { REVOKED_CONTROLLERS } from '$lib/constants/app.constants';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import type { AddAccessKeyScope } from '$lib/types/access-keys';
	import type { JunoModalCreateControllerDetail, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { add, load, segment } = $derived(detail as JunoModalCreateControllerDetail);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	let accessKeyId = $state('');
	let scope = $state<AddAccessKeyScope>('write');
	let identity: string | undefined = $state();

	const initAccessKey = (): string | undefined => {
		if (action === 'add') {
			return accessKeyId;
		}

		const key = Ed25519KeyIdentity.generate();

		identity = btoa(JSON.stringify({ token: key.toJSON() }));
		accessKeyId = key.getPrincipal().toText();

		return accessKeyId;
	};

	const addController = async ($event: SubmitEvent) => {
		$event.preventDefault();

		const accessKeyId = initAccessKey();

		if (isNullish(accessKeyId) || accessKeyId === '') {
			toasts.error({
				text: $i18n.errors.controller_invalid
			});
			return;
		}

		if (REVOKED_CONTROLLERS.includes(accessKeyId)) {
			toasts.error({
				text: 'The controller has been revoked for security reason!'
			});
			return;
		}

		wizardBusy.start();
		step = 'in_progress';

		const { result } = await add({
			accessKeyId,
			scope
		});

		wizardBusy.stop();

		if (result === 'error') {
			step = 'error';
			return;
		}

		await load();

		step = 'ready';
	};

	let action = $state<'generate' | 'add'>('generate');
	$effect(() => {
		action;

		untrack(() => (accessKeyId = ''));
	});
</script>

<Modal {onclose}>
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
						<Identifier identifier={accessKeyId} shorten={false} small={false} />
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

				<button class="close" onclick={onclose}>{$i18n.core.close}</button>
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

		<form class="content" onsubmit={addController}>
			<div>
				<label>
					<input name="action" type="radio" value="generate" bind:group={action} />
					<span>{$i18n.controllers.generate}</span>
				</label>
			</div>

			<label>
				<input name="action" type="radio" value="add" bind:group={action} />
				<span>{$i18n.controllers.manually}</span>
			</label>

			<input
				name="controller-id"
				aria-label={$i18n.controllers.controller_id_placeholder}
				autocomplete="off"
				data-1p-ignore
				disabled={action === 'generate'}
				placeholder={$i18n.controllers.controller_id_placeholder}
				required={action === 'add'}
				type="text"
				bind:value={accessKeyId}
			/>

			<div class="scope">
				<Value>
					{#snippet label()}
						{$i18n.controllers.scope}
					{/snippet}
					<select name="scope" bind:value={scope}>
						<option value="submit">{$i18n.controllers.submit}</option>
						<option value="write">{$i18n.controllers.write}</option>
						<option value="admin">{$i18n.controllers.admin}</option>
					</select>
				</Value>
			</div>

			<button
				disabled={action === 'add' && (isNullish(accessKeyId) || accessKeyId === '')}
				type="submit"
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
