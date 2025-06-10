<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import CanisterUpgradeWizard, {
		type CanisterUpgradeWizardProps
	} from '$lib/components/canister/CanisterUpgradeWizard.svelte';

	let { onclose, ...propsRest }: CanisterUpgradeWizardProps = $props();
</script>

<Modal {onclose}>
	<CanisterUpgradeWizard {onclose} {...propsRest} />
</Modal>
