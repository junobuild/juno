<script lang="ts">
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
</script>

<Modal {onclose}>
    <UpgradeChangeWizard {onclose} {satellite} {proposal} />
</Modal>
