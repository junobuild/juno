<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Rule } from '$declarations/satellite/satellite.did';
	import HostingSwitchMemory from '$lib/components/hosting/HostingSwitchMemory.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { getRuleDapp } from '$lib/services/collection.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlDid } from '$lib/types/declarations';

	interface Props {
		satellite: MissionControlDid.Satellite;
	}

	let { satellite }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id);

	let rule = $state<Rule | undefined>(undefined);
	let supportSettings = $state(false);
	let loading = $state(true);

	let memory = $derived(fromNullable(rule?.memory ?? []));

	const loadRule = async () => {
		const result = await getRuleDapp({ satelliteId, identity: $authStore.identity });
		rule = result?.rule;
		supportSettings = result?.result === 'success';

		loading = false;
	};

	onMount(() => {
		loadRule();
	});
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.core.settings}</span>

	<div class="columns-3 fit-column-1">
		<div>
			<Value>
				{#snippet label()}
					{$i18n.hosting.hosting_memory}
				{/snippet}

				{#if loading}
					<p><SkeletonText /></p>
				{:else if supportSettings && nonNullish(memory)}
					<p in:fade>{'Stable' in memory ? $i18n.collections.stable : $i18n.collections.heap}</p>
				{:else}
					<p in:fade>{$i18n.collections.heap}</p>
				{/if}
			</Value>
		</div>
	</div>
</div>

{#if supportSettings}
	<HostingSwitchMemory {memory} reload={loadRule} {satellite} />
{/if}
