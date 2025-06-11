<script lang="ts">
	import UpgradeCdnWizard from '$lib/components/cdn/wizard/UpgradeCdnWizard.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { JunoModalCdnUpgradeDetail, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let asset = $derived((detail as JunoModalCdnUpgradeDetail).asset);
	let satellite = $derived((detail as JunoModalCdnUpgradeDetail).satellite);
</script>

<Modal {onclose}>
	<UpgradeCdnWizard {satellite} {asset} {onclose} />
</Modal>
