<script lang="ts">
	import Canister from '$lib/components/canister/Canister.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import LaunchpadArticle from '$lib/components/launchpad/LaunchpadArticle.svelte';
	import SatelliteEnvironment from '$lib/components/satellites/SatelliteEnvironment.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { layoutSatellites } from '$lib/stores/app/layout-launchpad.store';
	import { SatellitesLayout } from '$lib/types/layout';
	import type { SatelliteUi } from '$lib/types/satellite';
	import { overviewLink } from '$lib/utils/nav.utils';

	interface Props {
		satellite: SatelliteUi;
	}

	let { satellite }: Props = $props();

	let { satellite_id } = $derived(satellite);

	let name = $derived(satellite.metadata.name);

	let tags = $derived(satellite.metadata.tags ?? []);

	let href = $derived(overviewLink(satellite.satellite_id));

	let row = $derived($layoutSatellites === SatellitesLayout.LIST);
</script>

<LaunchpadArticle ariaLabel={`${$i18n.core.open}: ${name}`} {href}>
	{#snippet description()}
		{name}
	{/snippet}

	{#snippet details()}
		<SatelliteEnvironment {satellite} />
	{/snippet}

	{#snippet icon()}
		<IconSatellite size={row ? '28px' : '48px'} />
	{/snippet}

	<Canister canisterId={satellite_id} {row} />

	{#if tags.length}
		<div class="tags" class:row>
			{#each tags as tag, index (`${tag}-${index}`)}
				<Badge color="primary-opaque">{tag}</Badge>
			{/each}
		</div>
	{/if}
</LaunchpadArticle>

<style lang="scss">
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/fonts';

	.tags {
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--padding);

		padding: var(--padding-1_5x) 0;

		&.row {
			.tags {
				padding: var(--padding) 0 0;
			}
		}
	}
</style>
