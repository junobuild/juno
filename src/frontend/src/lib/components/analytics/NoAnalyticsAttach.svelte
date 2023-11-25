<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy } from '$lib/stores/busy.store';
	import { Principal } from '@dfinity/principal';
	import IconInsertLink from '$lib/components/icons/IconInsertLink.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { debounce, isNullish, nonNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { attachOrbiter } from '$lib/services/mission-control.services';
	import { createEventDispatcher } from 'svelte';

	let visible: boolean | undefined;

	let validConfirm = false;
	let saving = false;

	let orbiterId = '';

	const assertForm = debounce(() => {
		try {
			validConfirm =
				nonNullish(orbiterId) && orbiterId !== '' && nonNullish(Principal.fromText(orbiterId));
		} catch (_err: unknown) {
			validConfirm = false;
		}
	});

	$: orbiterId, (() => assertForm())();

	const handleSubmit = async () => {
		if (!validConfirm) {
			// Submit is disabled if not valid
			toasts.error({
				text: $i18n.errors.orbiter_id_missing
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
			await attachOrbiter({
				missionControlId: $missionControlStore,
				orbiterId: Principal.fromText(orbiterId)
			});

			visible = false;

			dispatch('junoAttach');
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.satellite_name_update,
				detail: err
			});
		}

		busy.stop();
	};

	const dispatch = createEventDispatcher();
</script>

<button on:click={() => (visible = true)} class="menu"
	><IconInsertLink /> {$i18n.core.attach}</button
>

<Popover bind:visible center backdrop="dark">
	<form class="container" on:submit|preventDefault={handleSubmit}>
		<label for="orbiter">{$i18n.analytics.attach}:</label>

		<input
			id="orbiter"
			bind:value={orbiterId}
			type="text"
			placeholder={$i18n.analytics.attach_id}
			maxlength={64}
			disabled={saving}
		/>

		<button type="submit" class="submit" disabled={saving || !validConfirm}>
			{$i18n.core.submit}
		</button>
	</form>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.edit;
</style>
