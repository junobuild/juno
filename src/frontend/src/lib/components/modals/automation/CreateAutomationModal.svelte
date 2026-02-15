<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { SatelliteDid } from '$declarations';
	import AutomationCreateActions from '$lib/components/satellites/automation/create/AutomationCreateActions.svelte';
	import AutomationCreateConnectForm from '$lib/components/satellites/automation/create/AutomationCreateConnectForm.svelte';
	import AutomationCreateConnectReview from '$lib/components/satellites/automation/create/AutomationCreateConnectReview.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { createAutomationConfig } from '$lib/services/satellite/automation/automation.config.services';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { JunoModalDetail, JunoModalWithSatellite } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail: d, onclose }: Props = $props();

	let detail = $derived(d as JunoModalWithSatellite);

	let satellite = $derived(detail.satellite);

	let step: 'init' | 'review' | 'in_progress' | 'ready' | 'error' = $state('init');

	let repoUrl = $state('');
	let repoKey = $state<SatelliteDid.RepositoryKey | undefined>();

	const onConnect = ({ repoKey: k }: { repoKey: SatelliteDid.RepositoryKey }) => {
		repoKey = k;
		step = 'review';
	};

	const onconfirm = async ({ repoKey }: { repoKey: SatelliteDid.RepositoryKey }) => {
		wizardBusy.start();
		step = 'in_progress';

		const result = await createAutomationConfig({
			satellite,
			identity: $authIdentity,
			repoKey
		});

		wizardBusy.stop();

		if (result.result === 'error') {
			return;
		}

		step = 'ready';
	};
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<AutomationCreateActions {onclose} />
	{:else if step === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.core.configuring}</p>
		</SpinnerModal>
	{:else if nonNullish(repoKey) && step === 'review'}
		<div in:fade>
			<AutomationCreateConnectReview onback={() => (step = 'init')} {onconfirm} {repoKey} />
		</div>
	{:else}
		<AutomationCreateConnectForm oncontinue={onConnect} bind:repoUrl />
	{/if}
</Modal>

<style lang="scss">
	@use '../../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
