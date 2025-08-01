<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
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
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import WalletInlineBalance from '$lib/components/wallet/WalletInlineBalance.svelte';
	import { balance } from '$lib/derived/balance.derived';
	import {
		missionControlNotMonitored,
		missionControlSettingsLoaded
	} from '$lib/derived/mission-control-settings.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData } from '$lib/types/canister';

	let missionControlData: CanisterData | undefined = $state(undefined);
	let orbiterData: CanisterData | undefined = $state(undefined);
</script>

{#if nonNullish($missionControlIdDerived)}
	<Canister canisterId={$missionControlIdDerived} display={false} bind:data={missionControlData} />
{/if}

{#if nonNullish($orbiterStore)}
	<Canister canisterId={$orbiterStore.orbiter_id} display={false} bind:data={orbiterData} />
{/if}

<div class="analytics">
	<LaunchpadLink
		ariaLabel={`${$i18n.core.open}: ${$i18n.analytics.title}`}
		highlight={isNullish($orbiterStore)}
		href="/analytics"
		size="small"
	>
		<p>
			<span class="link-icon"><IconAnalytics size="24px" /></span>
			<span class="link">
				<span class="link-title"
					><span class="link-title-text">{$i18n.analytics.title}</span>
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

{#if nonNullish($missionControlIdDerived) && nonNullish($missionControlVersion)}
	<MissionControlDataLoader missionControlId={$missionControlIdDerived} />
{/if}

<div class="monitoring">
	<LaunchpadLink
		ariaLabel={`${$i18n.core.open}: ${$i18n.monitoring.title}`}
		highlight={$missionControlSettingsLoaded && $missionControlNotMonitored}
		href="/monitoring"
		size="small"
	>
		<p>
			<span class="link-icon"><IconTelescope /></span>
			<span class="link link-without-indicator">
				<span class="link-title"><span class="link-title-text">{$i18n.monitoring.title}</span></span
				>
			</span>
		</p>
	</LaunchpadLink>
</div>

<div class="mission-control">
	<LaunchpadLink
		ariaLabel={`${$i18n.core.open}: ${$i18n.mission_control.title}`}
		href="/mission-control"
		size="small"
	>
		<p>
			<span class="link-icon"><IconMissionControl /></span>
			<span class="link">
				<span class="link-title"
					><span class="link-title-text">{$i18n.mission_control.title}</span>
					<CanisterIndicator data={missionControlData} /></span
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

<div class="wallet">
	<LaunchpadLink
		ariaLabel={`${$i18n.core.open}: ${$i18n.wallet.title}`}
		href="/wallet"
		size="small"
	>
		<p>
			<span class="link-icon"><IconWallet /></span>
			<span class="link link-without-indicator">
				<span class="link-title"><span class="link-title-text">{$i18n.wallet.title}</span></span>
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
		justify-content: center;

		gap: var(--padding-3x);

		margin: 0 0 var(--padding);
	}

	.link-title {
		display: inline-flex;
		align-items: center;
		gap: var(--padding);
	}

	.link-title-text {
		max-width: calc(100% - var(--padding-4x));
		@include text.truncate;
	}

	.link-title-text,
	.link-without-indicator,
	.link-details {
		display: none;

		@include media.min-width(large) {
			display: block;
		}
	}

	.link {
		width: 100%;

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

	.link-icon {
		display: inline-flex;
		min-width: 24px;
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
