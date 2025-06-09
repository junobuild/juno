<script lang="ts">
	import { debounce } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { satellitesNotLoaded, satellitesStore } from '$lib/derived/satellites.derived';
	import { loadProposals as loadProposalsServices } from '$lib/services/proposals/proposals.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import {satellitesVersionLoaded} from "$lib/derived/version.derived";

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let loading: 'init' | 'in_progress' | 'done' | 'error' = $state('init');

	const loadProposals = async () => {
		if ($satellitesNotLoaded) {
			return;
		}

		if ($satellitesVersionLoaded) {
			return;
		}

		if (loading === 'in_progress') {
			return;
		}

		loading = 'in_progress';

		const { result } = await loadProposalsServices({
			satellites: $satellitesStore ?? [],
			identity: $authStore.identity
		});

		loading = result === 'loaded' ? 'done' : 'error';
	};

	const debounceLoadProposals = debounce(loadProposals);

	$effect(() => {
		$satellitesNotLoaded;
		$satellitesVersionLoaded;

		debounceLoadProposals();
	});
</script>

{#if ['in_progress', 'init'].includes(loading)}
	<div class="loading">
		<SpinnerParagraph>{$i18n.core.loading}</SpinnerParagraph>
	</div>
{:else}
	{@render children()}
{/if}
