<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '$lib/utils/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import type { SetControllerScope } from '$lib/types/controllers';
	import type { SetControllerParams } from '$lib/types/controllers';

	export let add: (
		params: {
			missionControlId: Principal;
		} & SetControllerParams
	) => Promise<void>;
	export let load: () => Promise<void>;

	let visible = false;

	const close = () => (visible = false);

	let controllerId = '';
	let scope: SetControllerScope = "write";

	const addController = async () => {
		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		busy.start();

		try {
			await add({
				missionControlId: $missionControlStore,
				controllerId,
				profile: undefined,
				scope
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
</script>

<button on:click={() => (visible = true)}>{$i18n.controllers.add_a_controller}</button>

<Popover bind:visible center={true} backdrop="dark">
	<form class="content" on:submit|preventDefault={addController}>
		<h3>{$i18n.controllers.add_a_controller}</h3>

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

		<button type="submit" disabled={$isBusy}>
			{$i18n.core.submit}
		</button>
	</form>
</Popover>

<style lang="scss">
	.content {
		padding: var(--padding-2x);
	}

	h3 {
		margin-bottom: var(--padding-2x);
	}

	form {
		width: calc(100% - var(--padding));
		display: flex;
		flex-direction: column;
		gap: var(--padding);
	}

	button {
		margin: var(--padding) 0 0;
	}
</style>
