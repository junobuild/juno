<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { JunoModalChangeDetail, JunoModalDetail } from '$lib/types/modal';
	import ApplyChangeWizard from '$lib/components/changes/wizard/ApplyChangeWizard.svelte';
	import UpgradeChangeWizard from '$lib/components/changes/wizard/UpgradeChangeWizard.svelte';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let proposal = $derived((detail as JunoModalChangeDetail).proposal);
	let satelliteId = $derived((detail as JunoModalChangeDetail).satelliteId);

	let step: 'change' | 'upgrade' = $state('change');

	const startUpgrade = () => (step = 'upgrade');
</script>

<Modal {onclose}>
	{#if step === 'upgrade'}
		<UpgradeChangeWizard {onclose} {satelliteId} {proposal} />
	{:else}
		<ApplyChangeWizard {proposal} {satelliteId} {onclose} {startUpgrade} />
	{/if}
</Modal>
