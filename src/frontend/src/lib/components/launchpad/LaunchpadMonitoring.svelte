<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import Canister from '$lib/components/canister/Canister.svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import LaunchpadArticle from '$lib/components/launchpad/LaunchpadArticle.svelte';
	import MissionControlDataLoader from '$lib/components/mission-control/MissionControlDataLoader.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { missionControlMonitored } from '$lib/derived/mission-control/mission-control-settings.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { layoutLaunchpad } from '$lib/stores/app/layout-launchpad.store';
	import { LaunchpadLayout } from '$lib/types/layout';

	let row = $derived($layoutLaunchpad === LaunchpadLayout.LIST);

	let enabled = $derived($missionControlMonitored);
</script>

{#if nonNullish($missionControlId) && nonNullish(missionControlVersion)}
	<MissionControlDataLoader missionControlId={$missionControlId} />
{/if}

{#if nonNullish($missionControlId)}
	<LaunchpadArticle ariaLabel={`${$i18n.core.open}: ${$i18n.monitoring.title}`} href="/monitoring">
		{#snippet description()}
			{$i18n.monitoring.title}
		{/snippet}

		{#snippet icon()}
			<IconTelescope size={row ? '28px' : '48px'} />
		{/snippet}

		<div class="canister" class:row>
			<Canister canisterId={$missionControlId} displayMemoryTotal={false} {row} />

			<span
				>{$i18n.monitoring.auto_refill}: {enabled ? $i18n.core.enabled : $i18n.core.disabled}</span
			>
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
