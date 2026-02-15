<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { type Snippet, untrack } from 'svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { satellite } from '$lib/derived/satellite.derived';
	import { loadSatelliteConfig } from '$lib/services/satellite/satellite-config.services';
	import type { Satellite } from '$lib/types/satellite';
	import type { Option } from '$lib/types/utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let loading = $state(false);

	const load = async (satellite: Option<Satellite>) => {
		// Satellite is either not loaded or not found
		if (isNullish(satellite)) {
			return;
		}

		if (loading) {
			return;
		}

		loading = true;

		await loadSatelliteConfig({
			satelliteId: satellite.satellite_id,
			identity: $authIdentity
		});

		loading = false;
	};

	$effect(() => {
		$satellite;

		untrack(() => {
			load($satellite);
		});
	});
</script>

{@render children()}
