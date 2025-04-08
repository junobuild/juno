<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { type Snippet, untrack } from 'svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { loadVersion } from '$lib/services/version.loader.services';
	import { authStore } from '$lib/stores/auth.store';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	const load = async () => {
		if (isNullish($missionControlIdDerived)) {
			return;
		}

		await loadVersion({
			satelliteId: undefined,
			missionControlId: $missionControlIdDerived,
			skipReload: true,
			identity: $authStore.identity
		});
	};

	$effect(() => {
		$missionControlIdDerived;

		untrack(load);
	});
</script>

{@render children?.()}
