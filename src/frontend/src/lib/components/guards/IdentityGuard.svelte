<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
</script>

{#if $authStore.identity === null}
	<p>{$i18n.core.not_logged_in}</p>
{:else}
	<slot />
{/if}
