<script lang="ts">
    import { debounce } from '@dfinity/utils';
    import { onDestroy, onMount, type Snippet } from 'svelte';
    import { orbiterNotLoaded } from '$lib/derived/orbiter.derived';
    import { satellitesNotLoaded } from '$lib/derived/satellites.derived';
    import { RegistryWorker } from '$lib/services/workers/worker.registry.services';
    import type { CanisterSegment } from '$lib/types/canister';

    interface Props {
        children: Snippet;
        segments: CanisterSegment[];
    }

    let { children, segments }: Props = $props();

    let worker = $state<RegistryWorker | undefined>(undefined);

    onMount(async () => (worker = await RegistryWorker.init()));
    onDestroy(() => worker?.terminate());

    const debounceLoad = debounce(() =>
        worker?.loadRegistry({
            segments
        })
    );

    $effect(() => {
        if ($satellitesNotLoaded) {
            return;
        }

        if ($orbiterNotLoaded) {
            return;
        }

        if (segments.length === 0) {
            return;
        }

        debounceLoad();
    });
</script>

{@render children()}
