<script lang="ts">
	import type { Snippet } from 'svelte';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { missionControlStore } from '$lib/derived/mission-control.derived';
	import type { Option } from '$lib/types/utils';
	import type { Principal } from '@dfinity/principal';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const load = async (missionControl: Option<Principal>) => {
		await loadSatellites({ missionControl });
	};

	$effect(() => {
		load($missionControlStore);
	});
</script>

{@render children()}
