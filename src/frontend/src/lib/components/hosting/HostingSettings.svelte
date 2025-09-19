<script lang="ts">
	import { fade } from 'svelte/transition';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import Value from '$lib/components/ui/Value.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import type { Rule } from '$declarations/satellite/satellite.did';
	import { getRuleUser } from '$lib/services/collection.services';
	import { authStore } from '$lib/stores/auth.store';
	import { onMount } from 'svelte';
	import { fromNullable, nonNullish } from '@dfinity/utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id);

	let rule = $state<Rule | undefined>(undefined);
	let supportSettings = $state(false);
	let loading = $state(true);

	let memory = $derived(fromNullable(rule?.memory ?? []));

	const loadRule = async () => {
		const result = await getRuleUser({ satelliteId, identity: $authStore.identity });
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

<style lang="scss">
	button {
		margin: 0 0 var(--padding-8x);
	}
</style>
