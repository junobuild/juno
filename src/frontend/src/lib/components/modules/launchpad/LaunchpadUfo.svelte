<script lang="ts">
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import Canister from '$lib/components/modules/canister/Canister.svelte';
	import LaunchpadArticle from '$lib/components/modules/launchpad/LaunchpadArticle.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { layoutLaunchpad } from '$lib/stores/app/layout-launchpad.store';
	import { LaunchpadLayout } from '$lib/types/layout';
	import { overviewLink, ufoLink } from '$lib/utils/nav.utils';
	import type { UfoUi } from '$lib/types/ufo';
	import UfoEnvironment from '$lib/components/ufos/UfoEnvironment.svelte';
	import IconUfo from '$lib/components/icons/IconUfo.svelte';

	interface Props {
		ufo: UfoUi;
	}

	let { ufo }: Props = $props();

	let { ufo_id } = $derived(ufo);

	let name = $derived(ufo.metadata.name);

	let tags = $derived(ufo.metadata.tags ?? []);

	let href = $derived(ufoLink(ufo.ufo_id));

	let row = $derived($layoutLaunchpad === LaunchpadLayout.LIST);
</script>

<LaunchpadArticle ariaLabel={`${$i18n.core.open}: ${name}`} {href}>
	{#snippet description()}
		{name}
	{/snippet}

	{#snippet details()}
		<UfoEnvironment {ufo} />
	{/snippet}

	{#snippet icon()}
		<IconUfo size={row ? '28px' : '48px'} />
	{/snippet}

	<Canister canisterId={ufo_id} {row} />

	{#if tags.length}
		<div class="tags" class:row>
			{#each tags as tag, index (`${tag}-${index}`)}
				<Badge color="primary-opaque">{tag}</Badge>
			{/each}
		</div>
	{/if}
</LaunchpadArticle>

<style lang="scss">
	@use '../../../styles/mixins/text';
	@use '../../../styles/mixins/fonts';

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
