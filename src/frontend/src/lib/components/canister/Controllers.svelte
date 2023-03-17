<script lang="ts">
	import { onMount } from 'svelte';
	import type { Principal } from '@dfinity/principal';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18n } from '$lib/stores/i18n.store';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { authStore } from '$lib/stores/auth.store';
	import ButtonDelete from '$lib/components/ui/ButtonDelete.svelte';
	import type { Controller } from '$declarations/mission_control/mission_control.did';

	export let list: () => Promise<[Principal, Controller][]>;
	export let remove: (params: {
		missionControlId: Principal;
		controller: Principal;
	}) => Promise<void>;

	// The canister and user are controllers of the mission control but not added in its state per default
	export let extraControllers: [Principal, Controller | undefined][] = [];

	let controllers: [Principal, Controller | undefined][] = [];

	const load = async () => {
		try {
			controllers = [...(await list()), ...extraControllers];
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.controllers_listing,
				detail: err
			});
		}
	};

	onMount(async () => await load());

	let selectedController: Principal | undefined;

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
				controller: selectedController
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

	let visible = false;

	let canDelete = (): boolean =>
		nonNullish(selectedController) &&
		nonNullish($authStore.identity) &&
		nonNullish($missionControlStore) &&
		![$missionControlStore.toText(), $authStore.identity.getPrincipal().toText()].includes(
			selectedController.toText()
		);

	const close = () => {
		selectedController = undefined;
		visible = false;
	};
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th> {$i18n.controllers.title} </th>
			</tr>
		</thead>
		<tbody>
			{#each controllers as [controllerId, controller] (controllerId.toText())}
				<tr
					><td>
						<ButtonDelete
							ariaLabel={$i18n.controllers.delete}
							on:click={() => {
								selectedController = controllerId;
								visible = true;
							}}
						/>

						<span>{controllerId.toText()}</span>
					</td></tr
				>
			{/each}
		</tbody>
	</table>
</div>

<Popover bind:visible center={true}>
	<div class="content">
		{#if canDelete()}
			<h3>{$i18n.controllers.delete_question}</h3>

			{#if nonNullish(selectedController)}
				<p>
					{@html i18nFormat($i18n.controllers.controller_id, [
						{
							placeholder: '{0}',
							value: selectedController.toText()
						}
					])}
				</p>
			{/if}

			<button type="button" on:click|stopPropagation={close} disabled={$isBusy}>
				{$i18n.core.no}
			</button>

			<button type="button" on:click|stopPropagation={deleteController} disabled={$isBusy}>
				{$i18n.core.yes}
			</button>
		{:else}
			<p>{$i18n.controllers.no_delete}</p>

			<p>{$i18n.controllers.more_delete}</p>

			<button type="button" on:click|stopPropagation={close}>
				{$i18n.core.ok}
			</button>
		{/if}
	</div>
</Popover>

<style lang="scss">
	.content {
		padding: var(--padding-2x);
	}
</style>
