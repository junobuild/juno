<script lang="ts">
	import { loadVersion } from '$lib/services/console.services';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { type Snippet, untrack } from 'svelte';

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
