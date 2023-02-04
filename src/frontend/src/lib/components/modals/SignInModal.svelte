<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import SignIn from '$lib/components/core/SignIn.svelte';
</script>

<Modal on:junoClose>
	<SignIn on:junoClose />
</Modal>
