<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import NotFound from '$lib/components/ui/NotFound.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { canisterStore } from '$lib/derived/canister.derived';
	import { consoleCanisters } from '$lib/derived/console/segments.derived';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

{#if $consoleCanisters === undefined}
	<SpinnerParagraph>{$i18n.canister.loading_canisters}</SpinnerParagraph>
{:else if $canisterStore === null}
	<div in:fade>
		<NotFound warnText={$i18n.errors.canister_no_found} />
	</div>
{:else}
	{@render children()}
{/if}
