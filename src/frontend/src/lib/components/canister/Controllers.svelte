<script lang="ts">
	import { onMount } from 'svelte';
	import type { Principal } from '@dfinity/principal';
	import { toasts } from '$lib/stores/toasts.store';
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { busy } from '$lib/stores/busy.store';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	export let list: () => Promise<Principal[]>;
	export let remove: (params: {
		missionControlId: Principal;
		controller: Principal;
	}) => Promise<void>;

	let controllers: Principal[] = [];

	const load = async () => {
		try {
			controllers = await list();
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

		selectedController = undefined;

		await load();

		busy.stop();
	};

	let visible = false;
	$: visible = nonNullish(selectedController);
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th> {$i18n.controllers.title} </th>
			</tr>
		</thead>
		<tbody>
			{#each controllers as controller (controller.toText())}
				<tr
					><td>
						<button
							class="icon"
							aria-label={$i18n.controllers.delete}
							type="button"
							on:click|stopPropagation={() => (selectedController = controller)}
							><IconDelete /></button
						>
						<span>{controller.toText()}</span>
					</td></tr
				>
			{/each}
		</tbody>
	</table>
</div>

<Popover bind:visible center={true}>
	<div class="content">
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

		<button
			type="button"
			on:click|stopPropagation={() => (selectedController = undefined)}
			disabled={$busy}
		>
			{$i18n.core.no}
		</button>

		<button type="button" on:click|stopPropagation={deleteController} disabled={$busy}>
			{$i18n.core.yes}
		</button>
	</div>
</Popover>

<style lang="scss">
	button {
		vertical-align: middle;
	}

	.content {
		padding: var(--padding-2x);
	}
</style>
