<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import { circOut, quintOut } from 'svelte/easing';
	import { slide, fade } from 'svelte/transition';
	import { page } from '$app/state';
	import NavmenuFooter from '$lib/components/core/NavmenuFooter.svelte';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconAuthentication from '$lib/components/icons/IconAuthentication.svelte';
	import IconDatastore from '$lib/components/icons/IconDatastore.svelte';
	import IconFunctions from '$lib/components/icons/IconFunctions.svelte';
	import IconHosting from '$lib/components/icons/IconHosting.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import IconStorage from '$lib/components/icons/IconStorage.svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import IconUpgradeDock from '$lib/components/icons/IconUpgradeDock.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';
	import { menuCollapsed, menuExpanded } from '$lib/derived/layout-menu.derived';
	import { pageSatelliteId } from '$lib/derived/page.derived.svelte';
	import { isSatelliteRoute } from '$lib/derived/route.derived.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { isRouteSelected } from '$lib/utils/nav.utils';

	let routeId: string | null = $derived(page.route.id);

	let satelliteId: string = $derived($pageSatelliteId ?? '');

	let queryParam = $derived(notEmptyString(satelliteId) ? `/?s=${satelliteId}` : '');
</script>

<Menu>
	<nav>
		<a
			role="menuitem"
			class="link"
			class:collapsed={$menuCollapsed}
			href={`/satellite${queryParam}`}
			class:selected={isRouteSelected({ routeId, path: 'satellite' })}
		>
			<IconSatellite size="24px" />
			<span>{$i18n.satellites.satellite}</span>
		</a>

		{#if $isSatelliteRoute}
			<div
				class="satellite-features"
				in:slide={{ delay: 0, duration: 150, easing: quintOut, axis: 'y' }}
				out:slide={{ delay: 0, duration: 100, easing: circOut, axis: 'y' }}
			>
				<a
					role="menuitem"
					class="link"
					class:collapsed={$menuCollapsed}
					href={`/authentication${queryParam}`}
					class:selected={isRouteSelected({ routeId, path: 'authentication' })}
				>
					<IconAuthentication size="24px" />
					<span>{$i18n.authentication.title}</span>
				</a>

				<a
					role="menuitem"
					class="link"
					class:collapsed={$menuCollapsed}
					href={`/datastore${queryParam}`}
					class:selected={isRouteSelected({ routeId, path: 'datastore' })}
				>
					<IconDatastore size="24px" />
					<span>{$i18n.datastore.title}</span>
				</a>

				<a
					role="menuitem"
					class="link"
					class:collapsed={$menuCollapsed}
					href={`/storage${queryParam}`}
					class:selected={isRouteSelected({ routeId, path: 'storage' })}
				>
					<IconStorage size="24px" />
					<span>{$i18n.storage.title}</span>
				</a>

				<a
					role="menuitem"
					class="link"
					class:collapsed={$menuCollapsed}
					href={`/functions${queryParam}`}
					class:selected={isRouteSelected({ routeId, path: 'functions' })}
				>
					<IconFunctions size="24px" />
					<span>{$i18n.functions.title}</span>
				</a>

				<a
					role="menuitem"
					class="link"
					class:collapsed={$menuCollapsed}
					href={`/hosting${queryParam}`}
					class:selected={isRouteSelected({ routeId, path: 'hosting' })}
				>
					<IconHosting size="24px" />
					<span>{$i18n.hosting.title}</span>
				</a>
			</div>
		{/if}

		<div>
			<a
				role="menuitem"
				href={`/analytics${queryParam}`}
				class:selected={isRouteSelected({ routeId, path: 'analytics' })}
				class="link not-themed"
				class:collapsed={$menuCollapsed}
			>
				<IconAnalytics size="20px" />
				<span>{$i18n.analytics.title}</span>
			</a>

			<a
				role="menuitem"
				href={`/monitoring${queryParam}`}
				class:selected={isRouteSelected({ routeId, path: 'monitoring' })}
				class="link not-themed"
				class:collapsed={$menuCollapsed}
			>
				<IconTelescope size={20} />
				<span>{$i18n.monitoring.title}</span>
			</a>

			<a
				role="menuitem"
				href={`/mission-control${queryParam}`}
				class:selected={isRouteSelected({ routeId, path: 'mission-control' })}
				class="link not-themed"
				class:collapsed={$menuCollapsed}
			>
				<IconMissionControl size="22px" />
				<span>{$i18n.mission_control.title}</span>
			</a>

			<a
				role="menuitem"
				href={`/wallet${queryParam}`}
				class:selected={isRouteSelected({ routeId, path: 'wallet' })}
				class="link not-themed"
				class:collapsed={$menuCollapsed}
			>
				<IconWallet />
				<span>{$i18n.wallet.title}</span>
			</a>

			<a
				role="menuitem"
				href={`/upgrade-dock${queryParam}`}
				class:selected={isRouteSelected({ routeId, path: 'upgrade-dock' })}
				class="link not-themed"
				class:collapsed={$menuCollapsed}
			>
				<IconUpgradeDock size="20px" />
				<span>{$i18n.upgrade.title}</span>
			</a>
		</div>
	</nav>

	{#if $menuExpanded}
		<div in:fade>
			<NavmenuFooter />
		</div>
	{/if}
</Menu>

<style lang="scss">
	@use '../../styles/mixins/fonts';
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/a11y';
	@use '../../styles/mixins/text';

	.selected {
		background: var(--color-background);
		color: var(--color-background-contrast);

		&:hover:not(:disabled),
		&:active:not(:disabled) {
			background: var(--color-background);
		}
	}

	a.link {
		display: flex;
		position: relative;
		justify-content: flex-start;
		align-items: center;

		gap: var(--padding);

		padding: var(--padding-1_5x) var(--padding-3x);

		transition: background var(--animation-time) ease-out;

		text-decoration: none;

		@include text.truncate;

		&:hover:not(:disabled),
		&:active:not(:disabled) {
			color: var(--color-primary-contrast);
			font-weight: var(--font-weight-bold);
		}

		span {
			font-size: var(--font-size-ultra-small);

			opacity: 1;
			transition: opacity var(--animation-time);
		}

		:global(svg) {
			width: 24px;
			min-width: 24px;
			height: 24px;
		}

		&.collapsed {
			span {
				opacity: 0;
			}
		}
	}

	@include media.dark-theme {
		a.link {
			&:hover:not(:disabled),
			&:active:not(:disabled) {
				color: var(--color-card-contrast);
			}
		}
	}

	nav {
		flex: 1;

		width: 100%;
		height: 100%;
	}

	.satellite-features {
		margin: 0 0 var(--padding-4x);
	}
</style>
