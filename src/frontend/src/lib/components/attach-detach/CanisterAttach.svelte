<script lang="ts">
	import { debounce, isNullish, nonNullish } from '@dfinity/utils';
	import { Principal } from '@icp-sdk/core/principal';
	import type { Snippet } from 'svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { busy, isBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
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

	let canisterId = $state('');

	const assertForm = debounce(() => {
		try {
			validConfirm =
				nonNullish(canisterId) && canisterId !== '' && nonNullish(Principal.fromText(canisterId));
		} catch (_err: unknown) {
			validConfirm = false;
		}
	});

	$effect(() => {
		canisterId;

		assertForm();
	});

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (!validConfirm) {
			// Submit is disabled if not valid
			toasts.error({
				text: $i18n.errors.canister_id_missing
			});
			return;
		}

		if (isNullish($missionControlId)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		busy.start();

		try {
			await setFn({
				missionControlId: $missionControlId,
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

<Popover backdrop="dark" center bind:visible>
	<form class="container" onsubmit={handleSubmit}>
		<h3>{@render title?.()}</h3>

		<label for="canisterId">{@render input?.()}:</label>

		<input
			id="canisterId"
			autocomplete="off"
			data-1p-ignore
			disabled={$isBusy}
			maxlength={64}
			placeholder="_____-_____-_____-_____-cai"
			type="text"
			bind:value={canisterId}
		/>

		<button class="submit" disabled={$isBusy || !validConfirm} type="submit">
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
