<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { getPageViews } from '$lib/api/orbiter.api';
	import { onMount } from 'svelte';
	import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';

	export let satelliteId: Principal;

	let loading = true;

	let data: [AnalyticKey, PageView][] = [];

	const load = async () => {
		try {
			data = await getPageViews({
				satelliteId,
				// TODO: orbiter id from mission control or console?
				orbiterId: Principal.fromText('aovwi-4maaa-aaaaa-qaagq-cai')
			});

			loading = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.analytics_load_error,
				detail: err
			});
		}
	};

	onMount(load);

	let uniqueVisitors: number = 0;
	$: uniqueVisitors = [...new Set(data.map(([key, _]) => key.session_id))].length;
</script>

<div class="card-container">
	{#if loading}
		<SpinnerParagraph>{$i18n.analytics.loading}</SpinnerParagraph>
	{:else}
		Unique visitors: {uniqueVisitors}
	{/if}
</div>
