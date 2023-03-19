<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import { authStore } from '$lib/stores/auth.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import Popover from '$lib/components/ui/Popover.svelte';

	export let visible = false;
	export let selectedController: Principal | undefined;
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

<Popover bind:visible center={true}>
	<div class="content">
		{#if canDelete()}
			<h3>{$i18n.controllers.delete_question}</h3>

			<p>
				{@html i18nFormat($i18n.controllers.controller_id, [
					{
						placeholder: '{0}',
						value: selectedController?.toText() ?? ''
					}
				])}
			</p>

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
