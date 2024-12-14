<script lang="ts">
	import Value from '$lib/components/ui/Value.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import {
		missionControlSettings,
		missionControlSettingsNotLoaded
	} from '$lib/derived/mission-control.derived';
	import { fromNullable } from '@dfinity/utils';

	interface Props {
		missionControlMonitored: boolean;
	}

	let { missionControlMonitored = $bindable(false) }: Props = $props();

	$effect(() => {
		missionControlMonitored =
			fromNullable(fromNullable($missionControlSettings?.monitoring ?? [])?.cycles ?? [])
				?.enabled === true;
	});
</script>

<Value>
	{#snippet label()}
		{$i18n.mission_control.title}
	{/snippet}

	{#if $missionControlSettingsNotLoaded}
		<p><SkeletonText /></p>
	{:else}
		<p>
			{missionControlMonitored ? $i18n.monitoring.monitored : $i18n.monitoring.not_monitored}
		</p>
	{/if}
</Value>
