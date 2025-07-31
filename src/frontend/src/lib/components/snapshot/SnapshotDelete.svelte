<script lang="ts">
	import { encodeSnapshotId } from '@dfinity/ic-management';
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import type { snapshot } from '$declarations/ic/ic.did';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { deleteSnapshot } from '$lib/services/snapshots.services';
	import { authStore } from '$lib/stores/auth.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { shortenWithMiddleEllipsis } from '$lib/utils/format.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		visible?: boolean;
		segmentLabel: string;
		existingSnapshot: snapshot | undefined;
		canisterId: Principal;
	}

	let { visible = $bindable(false), segmentLabel, existingSnapshot, canisterId }: Props = $props();

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (isNullish(existingSnapshot)) {
			toasts.error({ text: $i18n.errors.snapshot_not_selected });
			return;
		}

		busy.start();

		const { success } = await deleteSnapshot({
			canisterId,
			snapshot: existingSnapshot,
			identity: $authStore.identity
		});

		busy.stop();

		if (success !== 'ok') {
			return;
		}

		visible = false;
	};
</script>

<Popover backdrop="dark" center={true} bind:visible>
	<form class="content" onsubmit={onSubmit}>
		<h2>{$i18n.canisters.delete_snapshot}</h2>

		<p>
			{i18nFormat($i18n.canisters.delete_snapshot_confirm, [
				{
					placeholder: '{0}',
					value: nonNullish(existingSnapshot)
						? shortenWithMiddleEllipsis({ text: `0x${encodeSnapshotId(existingSnapshot.id)}` })
						: ''
				},
				{ placeholder: '{1}', value: segmentLabel }
			])}
		</p>

		<button disabled={$isBusy} onclick={() => (visible = false)} type="button">
			{$i18n.core.no}
		</button>

		<button disabled={$isBusy} type="submit">
			{$i18n.core.yes}
		</button>
	</form>
</Popover>

<style lang="scss">
	.content {
		padding: var(--padding-2x);
	}
</style>
