<script lang="ts">
	import Toast from './Toast.svelte';
	import { toasts } from '$lib/stores/toasts.store';
</script>

{#if $toasts.length > 0}
	<Toast msg={$toasts[0]} />
{/if}
