<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy } from '$lib/stores/busy.store';
	import { Principal } from '@dfinity/principal';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { debounce, isNullish, nonNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { createEventDispatcher } from 'svelte';

	export let setFn: (params: {
		missionControlId: Principal;
		canisterId: Principal;
	}) => Promise<void>;
	export let visible: boolean | undefined;

	let validConfirm = false;
	let saving = false;

	let canisterId = '';

	const assertForm = debounce(() => {
		try {
			validConfirm =
				nonNullish(canisterId) && canisterId !== '' && nonNullish(Principal.fromText(canisterId));
		} catch (_err: unknown) {
			validConfirm = false;
		}
	});

	$: canisterId, (() => assertForm())();

	const handleSubmit = async () => {
		if (!validConfirm) {
			// Submit is disabled if not valid
			toasts.error({
				text: $i18n.errors.canister_id_missing
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
			await setFn({
				missionControlId: $missionControlStore,
				canisterId: Principal.fromText(canisterId)
			});

			visible = false;

			dispatch('junoAttach');
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.canister_attach_error,
				detail: err
			});
		}

		busy.stop();
	};

	const dispatch = createEventDispatcher();
</script>

<Popover bind:visible center backdrop="dark">
	<form class="container" on:submit|preventDefault={handleSubmit}>
		<h3><slot name="title" /></h3>

		<label for="canisterId"><slot name="input" />:</label>

		<input
			id="canisterId"
			bind:value={canisterId}
			type="text"
			placeholder="_____-_____-_____-_____-cai"
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

	label {
		margin: var(--padding-1_5x) 0 0;
	}
</style>
