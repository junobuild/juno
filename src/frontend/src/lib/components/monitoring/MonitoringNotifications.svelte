<script lang="ts">
	import { fade } from 'svelte/transition';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import {
		missionControlEmail,
		missionControlMetadataLoaded
	} from '$lib/derived/mission-control.derived';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
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
