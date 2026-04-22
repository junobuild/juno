<script lang="ts">
	import type { Snippet } from 'svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

{#if $authIdentity === null}
	<p>{$i18n.core.not_logged_in}</p>

	<a class="button" href="/">{$i18n.not_found.go_home}</a>
{:else}
	{@render children()}
{/if}
