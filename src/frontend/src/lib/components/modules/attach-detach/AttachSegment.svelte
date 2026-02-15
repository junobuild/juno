<script lang="ts">
	import { Principal } from '@icp-sdk/core/principal';
	import type { Snippet } from 'svelte';
	import InputCanisterId from '$lib/components/app/core/InputCanisterId.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { isBusy } from '$lib/derived/app/busy.derived';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { attachSegment } from '$lib/services/attach-detach/attach.services';
	import { busy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		segment: 'satellite' | 'orbiter';
		visible: boolean | undefined;
		title?: Snippet;
		input?: Snippet;
		onsuccess: () => void;
	}

	let { segment, visible = $bindable(), title, input, onsuccess }: Props = $props();

	let validConfirm = $state(false);
	let canisterId = $state('');

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (!validConfirm) {
			// Submit is disabled if not valid
			toasts.error({
				text: $i18n.errors.canister_id_missing
			});
			return;
		}

		busy.start();

		const { result } = await attachSegment({
			segmentId: Principal.fromText(canisterId),
			segment,
			missionControlId: $missionControlId,
			identity: $authIdentity
		});

		busy.stop();

		if (result === 'error') {
			return;
		}

		visible = false;

		onsuccess();

		toasts.success({
			text: i18nCapitalize(
				i18nFormat($i18n.canisters.attach_success, [
					{
						placeholder: '{0}',
						value: segment
					}
				])
			)
		});
	};
</script>

<Popover backdrop="dark" center bind:visible>
	<form class="container" onsubmit={handleSubmit}>
		<h3>{@render title?.()}</h3>

		<InputCanisterId disabled={$isBusy} bind:canisterId bind:valid={validConfirm}>
			{#snippet label()}
				{@render input?.()}
			{/snippet}
		</InputCanisterId>

		<button class="submit" disabled={$isBusy || !validConfirm} type="submit">
			{$i18n.core.submit}
		</button>
	</form>
</Popover>

<style lang="scss">
	@use '../../../styles/mixins/dialog';

	@include dialog.edit;

	label {
		margin: var(--padding-1_5x) 0 0;
	}
</style>
