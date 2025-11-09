<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import type { Snippet } from 'svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { loadSatellites } from '$lib/services/satellites.services';
	import type { Option } from '$lib/types/utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const load = async (missionControlId: Option<Principal>) => {
		await loadSatellites({ missionControlId });
	};

	$effect(() => {
		load($missionControlIdDerived);
	});
</script>

{@render children()}
