<script lang="ts">
	import { debounce } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { satellitesNotLoaded } from '$lib/derived/mission-control/satellites.derived';
	import { satellitesStore } from '$lib/derived/satellites.derived';
	import { satellitesVersionNotLoaded } from '$lib/derived/version.derived';
	import { loadProposals as loadProposalsServices } from '$lib/services/satellite/proposals/proposals.list.services';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let loading: 'init' | 'in_progress' | 'done' | 'error' = $state('init');

	const loadProposals = async () => {
		if ($satellitesNotLoaded) {
			return;
		}

		if ($satellitesVersionNotLoaded) {
			return;
		}

		if (loading === 'in_progress') {
			return;
		}

		loading = 'in_progress';

		const { result } = await loadProposalsServices({
			satellites: $satellitesStore ?? [],
			identity: $authIdentity
		});

		loading = result === 'loaded' ? 'done' : 'error';
	};

	const debounceLoadProposals = debounce(loadProposals);

	$effect(() => {
		$satellitesNotLoaded;
		$satellitesVersionNotLoaded;

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
