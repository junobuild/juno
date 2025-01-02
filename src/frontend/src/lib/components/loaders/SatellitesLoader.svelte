<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Snippet } from 'svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { loadSatellites } from '$lib/services/satellites.services';
	import type { Option } from '$lib/types/utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const load = async (missionControl: Option<Principal>) => {
		await loadSatellites({ missionControl });
	};

	$effect(() => {
		load($missionControlIdDerived);
	});
</script>

{@render children()}
