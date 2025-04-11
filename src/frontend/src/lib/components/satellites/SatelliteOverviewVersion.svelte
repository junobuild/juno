<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { fade, blur } from 'svelte/transition';
	import SegmentVersion from '$lib/components/segments/SegmentVersion.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { SatelliteIdText } from '$lib/types/satellite';

	interface Props {
		satelliteId: SatelliteIdText;
	}

	let { satelliteId }: Props = $props();

	let satelliteVersion = $derived($versionStore?.satellites[satelliteId]?.current);

	let loaded = $derived(nonNullish($versionStore?.satellites[satelliteId]));

	let pkg = $derived($versionStore?.satellites[satelliteId]?.pkg);

	let deps = $derived($versionStore?.satellites[satelliteId]?.pkg?.dependencies);

	let developerVersion = $derived(
		nonNullish(deps) && nonNullish(pkg) ? pkg.version : satelliteVersion
	);

	// Deprecated version handling for Satellite < v0.0.23

	let currentBuild: string | undefined = $derived(
		$versionStore?.satellites[satelliteId]?.currentBuild
	);

	let extended = $derived(nonNullish(currentBuild) && currentBuild !== satelliteVersion);

	let build = $derived($versionStore?.satellites[satelliteId]?.build);
</script>

{#snippet deprecatedDisplayVersion()}
	{#if !extended}
		<SegmentVersion version={satelliteVersion} />
	{:else}
		<SegmentVersion label={$i18n.satellites.stock_version} version={satelliteVersion} />

		<SegmentVersion
			label={$i18n.satellites.extended_version}
			version={$versionStore?.satellites[satelliteId]?.currentBuild}
		/>
	{/if}

	<div>
		<Value>
			{#snippet label()}
				{$i18n.satellites.build}
			{/snippet}
			<p class="build">
				{#if nonNullish(build)}
					<span in:fade>{build}</span>
				{/if}
			</p>
		</Value>
	</div>
{/snippet}

{#snippet dependencies()}
	{#if nonNullish(deps)}
		<div>
			<Value>
				{#snippet label()}
					{$i18n.core.dependencies}
				{/snippet}

				<ul>
					{#each Object.entries(deps) as [key, version] (key)}
						<li>
							<Badge color="tertiary">{key}@{version}</Badge>
						</li>
					{/each}
				</ul>
			</Value>
		</div>
	{/if}
{/snippet}

{#snippet displayVersion()}
	<SegmentVersion version={developerVersion ?? satelliteVersion} />
{/snippet}

{#if loaded}
	{#if nonNullish(pkg)}
		{@render displayVersion()}

		{@render dependencies()}
	{:else}
		{@render deprecatedDisplayVersion()}
	{/if}
{:else}
	{@render displayVersion()}
{/if}

<style lang="scss">
	.build {
		text-transform: capitalize;
	}

	div:not(:first-of-type) {
		padding: var(--padding) 0 0;
	}

	ul {
		padding: var(--padding-0_25x) 0;
		margin: 0;
		list-style: none;
	}

	li {
		margin: 0 0 var(--padding-0_5x);
	}
</style>
