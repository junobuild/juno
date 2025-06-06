<script lang="ts">
	import { onMount } from 'svelte';
	import UpgradeDockFilter from '$lib/components/dock/UpgradeDockFilter.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	let loading: 'in_progress' | 'done' | 'error' = $state('in_progress');

	const loadVersions = () => {
		loading = 'done';
	};

	onMount(loadVersions);
</script>

{#if loading === 'in_progress'}
	<div class="loading">
		<SpinnerParagraph>{$i18n.core.loading}</SpinnerParagraph>
	</div>
{:else}
	<UpgradeDockFilter />
{/if}
