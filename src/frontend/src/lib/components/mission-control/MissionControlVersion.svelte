<script lang="ts">
	import { type Snippet, untrack } from 'svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { loadVersion } from '$lib/services/version.loader.services';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	const load = async () =>
		await loadVersion({
			satelliteId: undefined,
			missionControlId: $missionControlIdDerived,
			skipReload: true
		});

	$effect(() => {
		$missionControlIdDerived;

		untrack(load);
	});
</script>

{@render children?.()}
