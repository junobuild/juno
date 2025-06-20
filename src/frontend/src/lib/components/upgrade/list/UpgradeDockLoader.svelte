<script lang="ts">
	import { debounce } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { orbiterNotLoaded, orbiterStore } from '$lib/derived/orbiter.derived';
	import { satellitesNotLoaded, satellitesStore } from '$lib/derived/satellites.derived';
	import { loadVersions as loadVersionsServices } from '$lib/services/version/version.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
		children: Snippet;
	}

	let { missionControlId, children }: Props = $props();

	let loading: 'init' | 'in_progress' | 'done' | 'error' = $state('init');

	const loadModulesVersions = async (skipReload?: boolean) => {
		if ($satellitesNotLoaded) {
			return;
		}

		if ($orbiterNotLoaded) {
			return;
		}

		if (loading === 'in_progress') {
			return;
		}

		loading = 'in_progress';

		const { result } = await loadVersionsServices({
			missionControlId,
			orbiter: $orbiterStore,
			satellites: $satellitesStore ?? [],
			identity: $authStore.identity,
			skipReload
		});

		loading = result === 'loaded' ? 'done' : 'error';
	};

	const debounceLoadVersions = debounce(loadModulesVersions);

	$effect(() => {
		$satellitesNotLoaded;
		$satellitesStore;
		$orbiterNotLoaded;
		$orbiterStore;

		debounceLoadVersions();
	});
</script>

<svelte:window onjunoReloadVersions={async () => await loadModulesVersions(false)} />

{#if ['in_progress', 'init'].includes(loading)}
	<div class="loading">
		<SpinnerParagraph>{$i18n.core.loading}</SpinnerParagraph>
	</div>
{:else}
	{@render children()}
{/if}
