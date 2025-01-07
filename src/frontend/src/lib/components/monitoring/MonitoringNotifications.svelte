<script lang="ts">
	import { fade } from 'svelte/transition';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		missionControlEmail,
		missionControlMetadataLoaded
	} from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<Value>
	{#snippet label()}
		{$i18n.monitoring.notifications}
	{/snippet}

	{#if $missionControlMetadataLoaded}
		<p in:fade>{$missionControlEmail}</p>
	{:else}
		<p><SkeletonText /></p>
	{/if}
</Value>
