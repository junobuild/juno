<script lang="ts">
	import Canister from '$lib/components/canister/Canister.svelte';
	import IconCanister from '$lib/components/icons/IconCanister.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import LaunchpadArticle from '$lib/components/launchpad/LaunchpadArticle.svelte';
	import SatelliteEnvironment from '$lib/components/satellites/SatelliteEnvironment.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { layoutLaunchpad } from '$lib/stores/app/layout-launchpad.store';
	import { LaunchpadLayout } from '$lib/types/layout';
	import type { SatelliteUi } from '$lib/types/satellite';
	import type { SegmentCanisterUi } from '$lib/types/segment';
	import { canisterLink, overviewLink } from '$lib/utils/nav.utils';

	interface Props {
		canister: SegmentCanisterUi;
	}

	let { canister }: Props = $props();

	let { canisterId } = $derived(canister);

	let name = $derived(canister.metadata.name);

	let tags = $derived(canister.metadata.tags ?? []);

	let href = $derived(canisterLink(canister.canisterId));

	let row = $derived($layoutLaunchpad === LaunchpadLayout.LIST);

	// TODO: make SatelliteEnvironment generic
	let satellite = $derived(canister as unknown as SatelliteUi);
</script>

<LaunchpadArticle ariaLabel={`${$i18n.core.open}: ${name}`} {href}>
	{#snippet description()}
		{name}
	{/snippet}

	{#snippet details()}
		<SatelliteEnvironment {satellite} />
	{/snippet}

	{#snippet icon()}
		<IconCanister size={row ? '28px' : '48px'} />
	{/snippet}

	<Canister {canisterId} {row} />

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
