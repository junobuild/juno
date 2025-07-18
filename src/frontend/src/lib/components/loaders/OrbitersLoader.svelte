<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Snippet } from 'svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { loadOrbiters } from '$lib/services/orbiter/orbiters.services';
	import type { Option } from '$lib/types/utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const load = async (missionControlId: Option<Principal>) => {
		await loadOrbiters({ missionControlId });
	};

	$effect(() => {
		load($missionControlIdDerived);
	});
</script>

{@render children()}
