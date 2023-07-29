<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';

	let steps: 'init' | 'in_progress' | 'ready' | 'error' = 'init';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');
</script>

<Modal on:junoClose>
	{#if steps === 'ready'}
		<div class="msg">
			<slot name="outro" />
			<button on:click={close}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.canisters.upgrade_in_progress}</p>
		</SpinnerModal>
	{:else}
		<slot name="intro" />
	{/if}
</Modal>
