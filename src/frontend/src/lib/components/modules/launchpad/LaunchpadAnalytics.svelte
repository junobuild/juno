<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import Canister from '$lib/components/modules/canister/Canister.svelte';
	import LaunchpadArticle from '$lib/components/modules/launchpad/LaunchpadArticle.svelte';
	import { orbiter } from '$lib/derived/orbiter.derived.js';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { layoutLaunchpad } from '$lib/stores/app/layout-launchpad.store';
	import { LaunchpadLayout } from '$lib/types/layout';

	let row = $derived($layoutLaunchpad === LaunchpadLayout.LIST);
</script>

{#if nonNullish($orbiter)}
	<LaunchpadArticle ariaLabel={`${$i18n.core.open}: ${$i18n.analytics.title}`} href="/analytics">
		{#snippet description()}
			{$i18n.analytics.title}
		{/snippet}

		{#snippet icon()}
			<IconAnalytics size={row ? '28px' : '48px'} />
		{/snippet}

		<div class="canister" class:row>
			<Canister canisterId={$orbiter.orbiter_id} displayMemoryTotal={false} {row} />
		</div>
	</LaunchpadArticle>
{/if}

<style lang="scss">
	.canister {
		:global(p) {
			margin: 0 0 var(--padding-0_25x);
		}
	}

	.row {
		font-size: var(--font-size-small);
	}
</style>
