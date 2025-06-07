<script lang="ts">
	import UpgradeDockFilter from '$lib/components/dock/UpgradeDockFilter.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { loadVersions as loadVersionsServices } from '$lib/services/version/version.services';
	import {
		satellitesNotLoaded,
		satellitesStore
	} from '$lib/derived/satellites.derived';
	import { orbiterNotLoaded, orbiterStore } from '$lib/derived/orbiter.derived';
	import { debounce } from '@dfinity/utils';
	import { authStore } from '$lib/stores/auth.store';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	let loading: 'init' | 'in_progress' | 'done' | 'error' = $state('init');

	const loadModulesVersions = async () => {
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
			identity: $authStore.identity
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

{#if loading === 'in_progress'}
	<div class="loading">
		<SpinnerParagraph>{$i18n.core.loading}</SpinnerParagraph>
	</div>
{:else}
	<UpgradeDockFilter />
{/if}
