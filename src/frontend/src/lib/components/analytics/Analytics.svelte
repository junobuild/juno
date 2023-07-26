<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { getPageViews } from '$lib/api/orbiter.api';
	import { onMount } from 'svelte';
	import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';
	import Value from '$lib/components/ui/Value.svelte';

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

	let uniqueSessions: number = 0;
	$: uniqueSessions = [...new Set(data.map(([key, _]) => key.session_id))].length;

	let sessionsViews: Record<string, number> = {};
	$: sessionsViews = data.reduce(
		(acc, [{ session_id }, _]) => ({
			...acc,
			[session_id]: (acc[session_id] ?? 0) + 1
		}),
		{}
	);

	let bounceRate = 0;
	$: bounceRate = Object.entries(sessionsViews).filter(([key, value]) => value === 1).length;
</script>

<div class="card-container">
	{#if loading}
		<SpinnerParagraph>{$i18n.analytics.loading}</SpinnerParagraph>
	{:else}
		<Value>
			<svelte:fragment slot="label">Number of Sessions</svelte:fragment>
			<p>{uniqueSessions}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">Unique page views</svelte:fragment>
			<p>{data.length}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">Average page views per session</svelte:fragment>
			<p>{uniqueSessions / data.length}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">Bounce rate</svelte:fragment>
			<p>{bounceRate}</p>
		</Value>
	{/if}
</div>
