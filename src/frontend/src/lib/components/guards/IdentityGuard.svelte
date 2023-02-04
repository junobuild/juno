<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
</script>

{#if $authStore.identity === null}
	<p>Developer not logged in.</p>
{:else}
	<slot />
{/if}
