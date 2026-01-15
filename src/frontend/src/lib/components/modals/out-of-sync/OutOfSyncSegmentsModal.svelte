<script lang="ts">
	import { fade } from 'svelte/transition';
	import OutOfSyncForm from '$lib/components/out-of-sync/OutOfSyncForm.svelte';
	import ProgressOutOfSync from '$lib/components/out-of-sync/ProgressOutOfSync.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { reconcileSegments } from '$lib/services/attach-detach/out-of-sync.services';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { OutOfSyncProgress } from '$lib/types/progress-out-of-sync';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let step = $state<'init' | 'in_progress' | 'ready' | 'error'>('init');

	let progress = $state<OutOfSyncProgress | undefined>(undefined);
	const onProgress = (outOfSyncProgress: OutOfSyncProgress | undefined) =>
		(progress = outOfSyncProgress);

	const onsubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		$event.preventDefault();

		onProgress(undefined);

		wizardBusy.start();
		step = 'in_progress';

		const { result } = await reconcileSegments({
			identity: $authIdentity,
			missionControlId: $missionControlId,
			onProgress
		});

		wizardBusy.stop();

		if (result !== 'ok') {
			step = 'error';
			return;
		}

		step = 'ready';
	};
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<div class="msg" in:fade>
			<p>{$i18n.out_of_sync.modules_synced}</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<ProgressOutOfSync {progress} />
	{:else}
		<OutOfSyncForm {onsubmit} />
	{/if}
</Modal>

<style lang="scss">
	@use '../../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}

	button {
		margin-top: var(--padding-2x);
	}
</style>
