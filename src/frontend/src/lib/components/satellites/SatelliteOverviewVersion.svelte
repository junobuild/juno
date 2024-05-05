<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import Value from '$lib/components/ui/Value.svelte';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import { nonNullish } from '@dfinity/utils';
	import type { BuildType } from '@junobuild/admin';
	import { fade } from 'svelte/transition';

	export let satelliteId: SatelliteIdText;

	let currentBuild: string | undefined;
	$: currentBuild = $versionStore?.satellites[satelliteId]?.currentBuild;

	let extended = true;
	$: extended =
		nonNullish(currentBuild) && currentBuild !== $versionStore?.satellites[satelliteId]?.current;

	let build: BuildType | undefined;
	$: build = $versionStore?.satellites[satelliteId]?.build;
</script>

{#if !extended}
	<Value>
		<svelte:fragment slot="label">{$i18n.core.version}</svelte:fragment>
		<p>v{$versionStore?.satellites[satelliteId]?.current ?? '...'}</p>
	</Value>
{:else}
	<Value>
		<svelte:fragment slot="label">{$i18n.satellites.stock_version}</svelte:fragment>
		<p>v{$versionStore?.satellites[satelliteId]?.current ?? '...'}</p>
	</Value>

	<Value>
		<svelte:fragment slot="label">{$i18n.satellites.extended_version}</svelte:fragment>
		<p>v{$versionStore?.satellites[satelliteId]?.currentBuild ?? '...'}</p>
	</Value>
{/if}

<Value>
	<svelte:fragment slot="label">{$i18n.satellites.build}</svelte:fragment>
	<p class="build">
		{#if nonNullish(build)}
			<span in:fade>{build}</span>
		{/if}
	</p>
</Value>

<style lang="scss">
	.build {
		text-transform: capitalize;
	}
</style>
