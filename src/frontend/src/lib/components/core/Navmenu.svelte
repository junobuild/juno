<script lang="ts">
	import { isEmptyString } from '@dfinity/utils';
	import { circOut, quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { page } from '$app/state';
	import NavmenuFooter from '$lib/components/core/NavmenuFooter.svelte';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconAuthentication from '$lib/components/icons/IconAuthentication.svelte';
	import IconDatastore from '$lib/components/icons/IconDatastore.svelte';
	import IconFunctions from '$lib/components/icons/IconFunctions.svelte';
	import IconHosting from '$lib/components/icons/IconHosting.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconRocket from '$lib/components/icons/IconRocket.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import IconStorage from '$lib/components/icons/IconStorage.svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';
	import { satelliteIdStore } from '$lib/derived/satellite.derived';
	import { i18n } from '$lib/stores/i18n.store';

	let routeId: string | null = $derived(page.route.id);

	let satelliteId: string = $derived($satelliteIdStore ?? '');

	const isSelected = ({ routeId, path }: { routeId: string | null; path: string }): boolean =>
		routeId?.includes(path) ?? false;

	const satellitePaths = [
		'satellite',
		'authentication',
		'datastore',
		'storage',
		'functions',
		'hosting'
	];

	let satelliteSelected = $derived(
		satellitePaths.find((path) => isSelected({ routeId, path })) !== undefined
	);
</script>

<Menu>
	<nav>
		{#if isEmptyString(satelliteId)}
			<a class="link" href="/">
				<IconRocket size="24px" />
				<span>{$i18n.satellites.launchpad}</span>
			</a>
		{:else}
			<a
				class="link"
				href={`/satellite/?s=${satelliteId}`}
				class:selected={isSelected({ routeId, path: 'satellite' })}
			>
				<IconSatellite size="24px" />
				<span>{$i18n.satellites.satellite}</span>
			</a>

			{#if satelliteSelected}
				<div
					class="satellite-features"
					in:slide={{ delay: 0, duration: 150, easing: quintOut, axis: 'y' }}
					out:slide={{ delay: 0, duration: 100, easing: circOut, axis: 'y' }}
				>
					<a
						class="link"
						href={`/authentication/?s=${satelliteId}`}
						class:selected={isSelected({ routeId, path: 'authentication' })}
					>
						<IconAuthentication size="24px" />
						<span>{$i18n.authentication.title}</span>
					</a>

					<a
						class="link"
						href={`/datastore/?s=${satelliteId}`}
						class:selected={isSelected({ routeId, path: 'datastore' })}
					>
						<IconDatastore size="24px" />
						<span>{$i18n.datastore.title}</span>
					</a>

					<a
						class="link"
						href={`/storage/?s=${satelliteId}`}
						class:selected={isSelected({ routeId, path: 'storage' })}
					>
						<IconStorage size="24px" />
						<span>{$i18n.storage.title}</span>
					</a>

					<a
						class="link"
						href={`/functions/?s=${satelliteId}`}
						class:selected={isSelected({ routeId, path: 'functions' })}
					>
						<IconFunctions size="24px" />
						<span>{$i18n.functions.title}</span>
					</a>

					<a
						class="link"
						href={`/hosting/?s=${satelliteId}`}
						class:selected={isSelected({ routeId, path: 'hosting' })}
					>
						<IconHosting size="24px" />
						<span>{$i18n.hosting.title}</span>
					</a>
				</div>
			{/if}
		{/if}

		<div>
			<a
				href={`/analytics/?s=${satelliteId}`}
				class:selected={isSelected({ routeId, path: 'analytics' })}
				class="link not-themed"
			>
				<IconAnalytics size="20px" />
				<span>{$i18n.analytics.title}</span>
			</a>

			<a
				href={`/monitoring/?s=${satelliteId}`}
				class:selected={isSelected({ routeId, path: 'monitoring' })}
				class="link not-themed"
			>
				<IconTelescope size="20px" />
				<span>{$i18n.monitoring.title}</span>
			</a>

			<a
				href={`/mission-control/?s=${satelliteId}`}
				class:selected={isSelected({ routeId, path: 'mission-control' })}
				class="link not-themed"
			>
				<IconMissionControl size="22px" />
				<span>{$i18n.mission_control.title}</span>
			</a>

			<a
				href={`/wallet/?s=${satelliteId}`}
				class:selected={isSelected({ routeId, path: 'wallet' })}
				class="link not-themed"
			>
				<IconWallet />
				<span>{$i18n.wallet.title}</span>
			</a>
		</div>
	</nav>

	<NavmenuFooter />
</Menu>

<style lang="scss">
	@use '../../styles/mixins/fonts';
	@use '../../styles/mixins/media';

	.selected {
		background: var(--color-background);
		color: var(--color-background-contrast);

		&:hover:not(:disabled),
		&:active:not(:disabled) {
			background: var(--color-background);
		}
	}

	a.link {
		display: inline-flex;
		align-items: center;

		gap: var(--padding);

		padding: var(--padding-1_5x) var(--padding-4x);

		width: var(--menu-width);

		transition: background var(--animation-time) ease-out;

		text-decoration: none;

		&:hover:not(:disabled),
		&:active:not(:disabled) {
			color: var(--color-primary-contrast);
			font-weight: var(--font-weight-bold);
		}

		span {
			font-size: var(--font-size-ultra-small);
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
	}

	.satellite-features {
		margin: 0 0 var(--padding-4x);
	}
</style>
