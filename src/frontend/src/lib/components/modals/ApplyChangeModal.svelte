<script lang="ts">
	import ApplyChangeWizard from '$lib/components/changes/wizard/ApplyChangeWizard.svelte';
	import UpgradeChangeWizard from '$lib/components/changes/wizard/UpgradeChangeWizard.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { JunoModalChangeDetail, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let proposal = $derived((detail as JunoModalChangeDetail).proposal);
	let satellite = $derived((detail as JunoModalChangeDetail).satellite);

	let satelliteId = $derived(satellite.satellite_id.toText());

	let step: 'change' | 'upgrade' = $state('change');

	const startUpgrade = () => (step = 'upgrade');
</script>

<Modal {onclose}>
	{#if step === 'upgrade'}
		<UpgradeChangeWizard {onclose} {satellite} {proposal} />
	{:else}
		<ApplyChangeWizard {proposal} {satelliteId} {onclose} {startUpgrade} />
	{/if}
</Modal>
