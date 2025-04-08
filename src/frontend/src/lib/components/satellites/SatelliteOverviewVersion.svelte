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

	let loaded = $derived(nonNullish($versionStore?.satellites[satelliteId]));

	let pkg = $derived($versionStore?.satellites[satelliteId]?.pkg);

	let deps = $derived($versionStore?.satellites[satelliteId]?.pkg?.dependencies);

	let currentBuild: string | undefined = $derived(
		$versionStore?.satellites[satelliteId]?.currentBuild
	);

	let extended = $derived(
		nonNullish(currentBuild) && currentBuild !== $versionStore?.satellites[satelliteId]?.current
	);

	let build = $derived($versionStore?.satellites[satelliteId]?.build);
</script>

{#snippet version()}
	<SegmentVersion version={$versionStore?.satellites[satelliteId]?.current} />
{/snippet}

{#snippet deprecatedDisplay()}
	{#if !extended}
		{@render version()}
	{:else}
		<div>
			<Value>
				{#snippet label()}
					{$i18n.satellites.stock_version}
				{/snippet}
				<p>v{$versionStore?.satellites[satelliteId]?.current ?? '...'}</p>
			</Value>
		</div>

		<div>
			<Value>
				{#snippet label()}
					{$i18n.satellites.extended_version}
				{/snippet}
				<p>v{$versionStore?.satellites[satelliteId]?.currentBuild ?? '...'}</p>
			</Value>
		</div>
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
					Dependencies
				{/snippet}

				<ul>
					{#each Object.entries(deps) as [key, version]}
						<li>
							<Badge color="tertiary">{key}@{version}</Badge>
						</li>
					{/each}
				</ul>
			</Value>
		</div>
	{/if}
{/snippet}

{#if loaded}
	<div in:blur>
		{#if nonNullish(pkg)}
			{@render version()}
			{@render dependencies()}
		{:else}
			{@render deprecatedDisplay()}
		{/if}
	</div>
{/if}

<style lang="scss">
	.build {
		text-transform: capitalize;
	}

	div:not(:first-of-type) {
		padding: var(--padding) 0 0;
	}

	ul {
		padding: var(--padding) 0;
		margin: 0;
		list-style: none;
	}

	li {
		margin: 0 0 var(--padding-0_5x);
	}
</style>
