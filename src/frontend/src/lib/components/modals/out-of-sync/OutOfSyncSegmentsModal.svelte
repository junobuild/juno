<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import OutOfSyncForm from "$lib/components/out-of-sync/OutOfSyncForm.svelte";

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let step = $state<'init' | 'in_progress' | 'ready' | 'error'>('init');

	const onsubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();
	};
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		ready
	{:else if step === 'in_progress'}
		in progress
	{:else}
		<OutOfSyncForm {onclose} />
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
