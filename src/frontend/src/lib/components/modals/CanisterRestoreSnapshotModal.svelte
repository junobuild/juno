<script lang="ts">
	import { encodeSnapshotId } from '@dfinity/ic-management';
	import { Principal } from '@dfinity/principal';
	import ProgressSnapshot from '$lib/components/canister/ProgressSnapshot.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { restoreSnapshot } from '$lib/services/snapshots.services';
	import { authStore } from '$lib/stores/auth.store';
	import { isBusy, wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalRestoreSnapshotDetail } from '$lib/types/modal';
	import type { SnapshotProgress } from '$lib/types/progress-snapshot';
	import { formatToDate } from '$lib/utils/date.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { segment, snapshot } = $derived(detail as JunoModalRestoreSnapshotDetail);

	let step: 'edit' | 'in_progress' | 'ready' = $state('edit');

	let progress: SnapshotProgress | undefined = $state(undefined);
	const onProgress = (createProgress: SnapshotProgress | undefined) => (progress = createProgress);

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		onProgress(undefined);

		wizardBusy.start();
		step = 'in_progress';

		const canisterId = Principal.from(segment.canisterId);

		const { success } = await restoreSnapshot({
			canisterId,
			snapshot: $state.snapshot(snapshot),
			identity: $authStore.identity,
			onProgress
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			step = 'edit';
			return;
		}

		step = 'ready';
	};
</script>

<Modal on:junoClose={onclose}>
	{#if step === 'ready'}
		<div class="msg">
			<p>
				<Html
					text={i18nFormat($i18n.canisters.backup_restored, [
						{
							placeholder: '{0}',
							value: segment.label
						}
					])}
				/>
			</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<ProgressSnapshot segment={segment.segment} {progress} snapshotAction="restore" />
	{:else}
		<h2>{$i18n.canisters.backup}</h2>

		<div class="warning">
			<Warning>{$i18n.canisters.restore_backup_warning}</Warning>
		</div>

		<p>
			{i18nFormat($i18n.canisters.restore_backup_info, [
				{ placeholder: '{0}', value: segment.label },
				{ placeholder: '{1}', value: formatToDate(snapshot.taken_at_timestamp) },
				{ placeholder: '{2}', value: `0x${encodeSnapshotId(snapshot.id)}` }
			])}
		</p>

		<form class="content" onsubmit={handleSubmit}>
			<button type="submit" disabled={$isBusy}>
				{$i18n.canisters.restore_the_backup}
			</button>
		</form>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';
	@use '../../styles/mixins/media';

	.msg {
		@include overlay.message;
	}

	.warning {
		--warning-margin: var(--padding-2x) 0;
	}
</style>
