<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import type { OrbiterSatelliteConfig } from '$declarations/orbiter/orbiter.did';
	import OrbiterConfigSave from '$lib/components/orbiter/OrbiterConfigSave.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { listOrbiterSatelliteConfigs } from '$lib/services/orbiters.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { satellitesStore } from '$lib/stores/satellite.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { OrbiterSatelliteConfigEntry } from '$lib/types/ortbiter';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import OrbiterConfigEdit from "$lib/components/orbiter/OrbiterConfigEdit.svelte";

	interface Props {
		orbiterId: Principal;
	}

	let { orbiterId }: Props = $props();

	let configuration: Record<SatelliteIdText, OrbiterSatelliteConfigEntry> = $state({});

	const list = (orbiterVersion: string): Promise<[Principal, OrbiterSatelliteConfig][]> =>
		listOrbiterSatelliteConfigs({ orbiterId, identity: $authStore.identity, orbiterVersion });

	const load = async () => {
		if (isNullish($versionStore.orbiter?.current)) {
			return;
		}

		try {
			const configs = await list($versionStore.orbiter.current);
			loadConfig(configs);
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.orbiter_configuration_listing,
				detail: err
			});
		}
	};

	const loadConfig = (configs: [Principal, OrbiterSatelliteConfig][]) => {
		configuration = ($satellitesStore ?? []).reduce((acc, satellite) => {
			const config: [Principal, OrbiterSatelliteConfig] | undefined = (configs ?? []).find(
				([satelliteId, _]) => satelliteId.toText() === satellite.satellite_id.toText()
			);

			console.log(config)

			const entry = config?.[1];
			const enabled = nonNullish(fromNullable(entry?.features ?? []));

			return {
				...acc,
				[satellite.satellite_id.toText()]: {
					name: satelliteName(satellite),
					enabled,
					config: config?.[1]
				}
			};
		}, {});
	};

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		$versionStore, (async () => await load())();
	});

	// [Principal, SatelliteConfig]
	const onUpdate = ({ detail }: CustomEvent<[Principal, OrbiterSatelliteConfig][]>) => {
		loadConfig(detail);
	};

	let enabledSatellites = $derived(
		Object.entries(configuration)
			.map(([_, { name }]) => name)
			.join(', ')
	);

	let visible = $state(false);
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.core.config}</span>

	<div class="columns-3 fit-column-1">
		<div>
			<Value>
				{#snippet label()}
					{$i18n.analytics.enabled_satellites}
				{/snippet}

				<p class="satellites">{enabledSatellites}</p>
			</Value>
		</div>

		<div>
			<div>
				<Value>
					{#snippet label()}
						{$i18n.analytics.page_views}
					{/snippet}

					<p class="satellites">{$i18n.analytics.enabled}</p>
				</Value>
			</div>

			<div>
				<Value>
					{#snippet label()}
						{$i18n.analytics.tracked_events}
					{/snippet}

					<p class="satellites">{$i18n.analytics.enabled}</p>
				</Value>
			</div>

			<div>
				<Value>
					{#snippet label()}
						{$i18n.analytics.web_vitals}
					{/snippet}

					<p class="satellites">{$i18n.analytics.disabled}</p>
				</Value>
			</div>
		</div>
	</div>
</div>

{#if ($satellitesStore ?? []).length > 0}
	<button onclick={() => visible = true}>
		{$i18n.core.edit_config}
	</button>
{/if}

{#if visible}
	<OrbiterConfigEdit {orbiterId} {configuration} onclose={() => visible = false} />
	{/if}

<style lang="scss">
	@use '../../styles/mixins/text';

	.satellites {
		@include text.clamp(3);
	}
</style>
