<script lang="ts">
	import type { JunoModalDetail, JunoModalSegmentDetail } from '$lib/types/modal';
	import { isBusy, wizardBusy } from '$lib/stores/busy.store';
	import { Principal } from '@dfinity/principal';
	import { fade } from 'svelte/transition';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { snapshotStore } from '$lib/stores/snapshot.store';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { createSnapshot } from '$lib/services/snapshots.services';
	import { authStore } from '$lib/stores/auth.store';
	import ProgressUpgradeVersion from "$lib/components/upgrade/ProgressUpgradeVersion.svelte";
	import ProgressCreateSnapshot from "$lib/components/canister/ProgressCreateSnapshot.svelte";
	import type {UpgradeCodeProgress} from "@junobuild/admin";
	import type {CreateSnapshotProgress} from "$lib/types/snapshot";

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { segment } = $derived(detail as JunoModalSegmentDetail);

	let steps: 'edit' | 'in_progress' | 'ready' = $state('edit');

	let progress: CreateSnapshotProgress | undefined = $state(undefined);
	const onProgress = (createProgress: CreateSnapshotProgress | undefined) =>
			(progress = createProgress);

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (isNullish($snapshotStore?.[segment.canisterId])) {
			toasts.error({ text: $i18n.errors.snapshot_not_loaded });
			return;
		}

		onProgress(undefined);

		wizardBusy.start();
		steps = 'in_progress';

		const canisterId = Principal.from(segment.canisterId);

		wizardBusy.stop();

		// TODO: the day the IC supports multiple snapshots per canister, we should extend the UI with a picker to provide users
		const { success } = await createSnapshot({
			canisterId,
			snapshotId: $snapshotStore?.[segment.canisterId]?.[0]?.id,
			identity: $authStore.identity,
			onProgress
		});

		if (success !== 'ok') {
			steps = 'edit';
			return;
		}

		steps = 'ready';
	};

	let warnExistingBackup = $derived(($snapshotStore?.[segment.canisterId]?.length ?? 0) > 0);
</script>

<Modal on:junoClose={onclose}>
	{#if steps === 'ready'}
		<div class="msg">
			<p>
				<Html
					text={i18nFormat($i18n.canisters.backup_created, [
						{
							placeholder: '{0}',
							value: segment.label
						}
					])}
				/>
			</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'in_progress'}
		<ProgressCreateSnapshot segment={segment.segment} {progress} />
	{:else}
		<h2>{$i18n.canisters.backup}</h2>

		<p>
			{i18nFormat($i18n.canisters.backup_info, [{ placeholder: '{0}', value: segment.label }])}
		</p>

		{#if warnExistingBackup}
			<div in:fade>
				<Warning>{$i18n.canisters.backup_warning}</Warning>
			</div>
		{/if}

		<form class="content" onsubmit={handleSubmit}>
			<div class="container">
				<button type="submit" disabled={$isBusy}>
					{$i18n.canisters.create_a_backup}
				</button>
			</div>
		</form>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';
	@use '../../styles/mixins/media';

	.msg {
		@include overlay.message;
	}

	.container {
		margin: var(--padding-4x) 0;
	}
</style>
