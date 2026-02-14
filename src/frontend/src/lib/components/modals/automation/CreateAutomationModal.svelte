<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { SatelliteDid } from '$declarations';
	import AutomationCreateConnectForm from '$lib/components/automation/create/AutomationCreateConnectForm.svelte';
	import AutomationCreateConnectReview from '$lib/components/automation/create/AutomationCreateConnectReview.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let step: 'init' | 'review' | 'in_progress' | 'ready' | 'error' = $state('init');

	let repoKey = $state<SatelliteDid.RepositoryKey | undefined>();

	const onConnect = ({ repoKey: k }: { repoKey: SatelliteDid.RepositoryKey }) => {
		repoKey = k;
		step = 'review';
	};

	const onsubmit = async () => {};
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<div class="msg">
			<p>{$i18n.core.configuration_applied}</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.core.updating_configuration}</p>
		</SpinnerModal>
	{:else if nonNullish(repoKey) && step === 'review'}
		<AutomationCreateConnectReview onback={() => step === 'init'} {onsubmit} {repoKey} />
	{:else}
		<AutomationCreateConnectForm oncontinue={onConnect} />
	{/if}
</Modal>

<style lang="scss">
	@use '../../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
