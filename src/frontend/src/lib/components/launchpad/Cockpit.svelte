<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterIndicator from '$lib/components/canister/CanisterIndicator.svelte';
	import CanisterTCycles from '$lib/components/canister/CanisterTCycles.svelte';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import LaunchpadLink from '$lib/components/launchpad/LaunchpadLink.svelte';
	import MissionControlDataLoader from '$lib/components/mission-control/MissionControlDataLoader.svelte';
	import MissionControlVersion from '$lib/components/mission-control/MissionControlVersion.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import WalletInlineBalance from '$lib/components/wallet/WalletInlineBalance.svelte';
	import WalletLoader from '$lib/components/wallet/WalletLoader.svelte';
	import { balance } from '$lib/derived/balance.derived';
	import {
		missionControlNotMonitored,
		missionControlSettingsLoaded
	} from '$lib/derived/mission-control-settings.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData } from '$lib/types/canister';

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		$missionControlIdDerived,
			(async () => await loadOrbiters({ missionControlId: $missionControlIdDerived }))();
	});

	let missionControlData: CanisterData | undefined = $state(undefined);
	let orbiterData: CanisterData | undefined = $state(undefined);
</script>

{#if nonNullish($missionControlIdDerived)}
	<Canister
		canisterId={$missionControlIdDerived}
		segment="mission_control"
		display={false}
		bind:data={missionControlData}
	/>
{/if}

{#if nonNullish($orbiterStore)}
	<Canister
		canisterId={$orbiterStore.orbiter_id}
		segment="orbiter"
		display={false}
		bind:data={orbiterData}
	/>
{/if}

<div class="analytics">
	<LaunchpadLink
		size="small"
		href="/analytics"
		ariaLabel={`${$i18n.core.open}: ${$i18n.analytics.title}`}
		highlight={isNullish($orbiterStore)}
	>
		<p>
			<IconAnalytics size="24px" />
			<span class="link">
				<span class="link-title"
					>{$i18n.analytics.title}
					{#if nonNullish($orbiterStore)}<CanisterIndicator data={orbiterData} />{/if}</span
				>
				{#if nonNullish($orbiterStore)}
					<span class="link-details">
						{#if isNullish(orbiterData)}
							<SkeletonText />
						{:else}
							<span in:fade><CanisterTCycles data={orbiterData} /></span>
						{/if}
					</span>
				{/if}
			</span>
		</p>
	</LaunchpadLink>
</div>

<MissionControlVersion />

{#if nonNullish($missionControlIdDerived) && nonNullish($missionControlVersion)}
	<MissionControlDataLoader missionControlId={$missionControlIdDerived} />
{/if}

<div class="monitoring">
	<LaunchpadLink
		size="small"
		href="/monitoring"
		ariaLabel={`${$i18n.core.open}: ${$i18n.monitoring.title}`}
		highlight={$missionControlSettingsLoaded && $missionControlNotMonitored}
	>
		<p>
			<IconTelescope />
			<span class="link">
				<span class="link-title">{$i18n.monitoring.title}</span>
			</span>
		</p>
	</LaunchpadLink>
</div>

<div class="mission-control">
	<LaunchpadLink
		size="small"
		href="/mission-control"
		ariaLabel={`${$i18n.core.open}: ${$i18n.mission_control.title}`}
	>
		<p>
			<IconMissionControl />
			<span class="link">
				<span class="link-title"
					>{$i18n.mission_control.title} <CanisterIndicator data={missionControlData} /></span
				>
				<span class="link-details">
					{#if isNullish(missionControlData)}
						<SkeletonText />
					{:else}
						<span in:fade><CanisterTCycles data={missionControlData} /></span>
					{/if}
				</span>
			</span>
		</p>
	</LaunchpadLink>
</div>

{#if nonNullish($missionControlIdDerived)}
	<WalletLoader missionControlId={$missionControlIdDerived} />
{/if}

<div class="wallet">
	<LaunchpadLink
		size="small"
		href="/wallet"
		ariaLabel={`${$i18n.core.open}: ${$i18n.wallet.title}`}
	>
		<p>
			<IconWallet />
			<span class="link">
				<span class="link-title">{$i18n.wallet.title}</span>
				<span class="link-details">
					<WalletInlineBalance balance={$balance} />
				</span>
			</span>
		</p>
	</LaunchpadLink>
</div>

<style lang="scss">
	@use '../../../lib/styles/mixins/grid';
	@use '../../../lib/styles/mixins/media';
	@use '../../../lib/styles/mixins/fonts';
	@use '../../../lib/styles/mixins/text';

	p {
		@include fonts.bold(true);

		display: flex;
		align-items: center;
		gap: var(--padding-3x);

		margin: 0 0 var(--padding);
	}

	.link-title {
		display: inline-flex;
		align-items: center;
		gap: var(--padding);
	}

	.link {
		display: none;

		@include text.truncate;

		@include media.min-width(large) {
			display: flex;
			flex-direction: column;
		}
	}

	.link-details {
		font-size: var(--font-size-small);
		font-weight: normal;

		--skeleton-text-padding: 0 0 var(--padding);
	}

	.mission-control {
		@include media.min-width(large) {
			grid-column: 7 / 10;
		}
	}

	.analytics {
		@include media.min-width(large) {
			grid-column: 1 / 4;
		}
	}

	.monitoring {
		@include media.min-width(large) {
			grid-column: 4 / 7;
		}
	}

	.wallet {
		@include media.min-width(large) {
			grid-column: 10 / 13;
		}
	}
</style>
