<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { fade } from 'svelte/transition';
	import ProgressSnapshot from '$lib/components/canister/ProgressSnapshot.svelte';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { createSnapshot } from '$lib/services/snapshots.services';
	import { authStore } from '$lib/stores/auth.store';
	import { isBusy, wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { snapshotStore } from '$lib/stores/snapshot.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { JunoModalDetail, JunoModalSegmentDetail } from '$lib/types/modal';
	import type { SnapshotProgress } from '$lib/types/progress-snapshot';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { segment } = $derived(detail as JunoModalSegmentDetail);

	let step: 'edit' | 'in_progress' | 'ready' = $state('edit');

	let progress: SnapshotProgress | undefined = $state(undefined);
	const onProgress = (createProgress: SnapshotProgress | undefined) => (progress = createProgress);

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if ($snapshotStore?.[segment.canisterId] === undefined) {
			toasts.error({ text: $i18n.errors.snapshot_not_loaded });
			return;
		}

		onProgress(undefined);

		wizardBusy.start();
		step = 'in_progress';

		const canisterId = Principal.from(segment.canisterId);

		// TODO: the day the IC supports multiple snapshots per canister, we should extend the UI with a picker to provide users
		const { success } = await createSnapshot({
			canisterId,
			snapshotId: $snapshotStore?.[segment.canisterId]?.[0]?.id,
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

	let warnExistingSnapshot = $derived(($snapshotStore?.[segment.canisterId]?.length ?? 0) > 0);
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<Confetti />

		<div class="msg">
			<p>
				<Html
					text={i18nFormat($i18n.canisters.snapshot_created, [
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
		<ProgressSnapshot {progress} segment={segment.segment} snapshotAction="create" />
	{:else}
		<h2>{$i18n.canisters.snapshot}</h2>

		{#if warnExistingSnapshot}
			<div class="warning" in:fade>
				<Warning>{$i18n.canisters.create_snapshot_warning}</Warning>
			</div>
		{/if}

		<p>
			{i18nFormat($i18n.canisters.create_snapshot_info, [
				{ placeholder: '{0}', value: segment.label }
			])}
		</p>

		<form class="content" onsubmit={handleSubmit}>
			<button disabled={$isBusy} type="submit">
				{$i18n.canisters.create_a_snapshot}
			</button>
		</form>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}

	.warning {
		--warning-margin: var(--padding-2x) 0;
	}
</style>
