<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { debounce, isNullish, nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import { run, preventDefault } from 'svelte/legacy';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		setFn: (params: { missionControlId: MissionControlId; canisterId: Principal }) => Promise<void>;
		visible: boolean | undefined;
		title?: Snippet;
		input?: Snippet;
		attach: () => void;
	}

	let { setFn, visible = $bindable(), title, input, attach }: Props = $props();

	let validConfirm = $state(false);
	let saving = false;

	let canisterId = $state('');

	const assertForm = debounce(() => {
		try {
			validConfirm =
				nonNullish(canisterId) && canisterId !== '' && nonNullish(Principal.fromText(canisterId));
		} catch (_err: unknown) {
			validConfirm = false;
		}
	});

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		canisterId, (() => assertForm())();
	});

	const handleSubmit = async () => {
		if (!validConfirm) {
			// Submit is disabled if not valid
			toasts.error({
				text: $i18n.errors.canister_id_missing
			});
			return;
		}

		if (isNullish($missionControlIdDerived)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		busy.start();

		try {
			await setFn({
				missionControlId: $missionControlIdDerived,
				canisterId: Principal.fromText(canisterId)
			});

			visible = false;

			attach();
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.canister_attach_error,
				detail: err
			});
		}

		busy.stop();
	};
</script>

<Popover bind:visible center backdrop="dark">
	<form class="container" onsubmit={preventDefault(handleSubmit)}>
		<h3>{@render title?.()}</h3>

		<label for="canisterId">{@render input?.()}:</label>

		<input
			id="canisterId"
			bind:value={canisterId}
			type="text"
			placeholder="_____-_____-_____-_____-cai"
			maxlength={64}
			disabled={saving}
			autocomplete="off"
			data-1p-ignore
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
