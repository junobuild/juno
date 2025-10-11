<script lang="ts">
	import Canister from '$lib/components/canister/Canister.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import LaunchpadLink from '$lib/components/launchpad/LaunchpadLink.svelte';
	import SatelliteEnvironment from '$lib/components/satellites/SatelliteEnvironment.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutSatellites } from '$lib/stores/layout-launchpad.store';
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

<LaunchpadLink ariaLabel={`${$i18n.core.open}: ${name}`} {href} {row}>
	{#snippet summary()}
		<div class="description">
			<p>{name}</p>
			<SatelliteEnvironment {satellite} />
		</div>
		<IconSatellite size={row ? '28px' : '48px'} />
	{/snippet}

	<div class="details" class:row>
		<Canister canisterId={satellite_id} {row} />

		<div class="tags">
			{#each tags as tag, index (`${tag}-${index}`)}
				<Badge color="primary-opaque">{tag}</Badge>
			{/each}
		</div>
	</div>
</LaunchpadLink>

<style lang="scss">
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/fonts';

	p {
		@include fonts.bold(true);

		@include text.truncate;
		margin: 0;
	}

	.description {
		display: flex;
		flex-direction: column;
		gap: var(--padding-0_25x);

		max-width: calc(100% - 48px);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--padding);

		padding: var(--padding-1_5x) 0;
	}

	.details.row {
		.tags {
			padding: var(--padding) 0 0;
		}
	}
</style>
