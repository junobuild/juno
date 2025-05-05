<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, notEmptyString } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		orbiterFeatures,
		orbiterSatellitesConfig
	} from '$lib/derived/orbiter-satellites.derived';
	import { sortedSatellites } from '$lib/derived/satellites.derived';
	import { loadOrbiterConfigs } from '$lib/services/orbiter/orbiters.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		orbiterId: Principal;
	}

	let { orbiterId }: Props = $props();

	const load = async () => {
		if (isNullish($versionStore.orbiter?.current)) {
			return;
		}

		await loadOrbiterConfigs({
			orbiterId,
			orbiterVersion: $versionStore.orbiter.current,
			reload: true
		});
	};

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		$versionStore, (async () => await load())();
	});

	let enabledSatellites = $derived(
		Object.entries($orbiterSatellitesConfig)
			.filter(([_, { enabled }]) => enabled)
			.map(([_, { name }]) => name)
			.join(', ')
	);

	const openModal = () => {
		emit({
			message: 'junoModal',
			detail: {
				type: 'edit_orbiter_config',
				detail: {
					config: $orbiterSatellitesConfig,
					features: $orbiterFeatures,
					orbiterId
				}
			}
		});
	};
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.core.config}</span>

	<div class="columns-3 fit-column-1">
		<div>
			<Value>
				{#snippet label()}
					{$i18n.analytics.enabled_satellites}
				{/snippet}

				<p class="satellites">
					{notEmptyString(enabledSatellites) ? enabledSatellites : $i18n.core.none}
				</p>
			</Value>
		</div>

		<div>
			<div>
				<Value>
					{#snippet label()}
						{$i18n.analytics.page_views}
					{/snippet}

					<p class="satellites">
						{$orbiterFeatures?.page_views === true ? $i18n.core.enabled : $i18n.core.disabled}
					</p>
				</Value>
			</div>

			<div>
				<Value>
					{#snippet label()}
						{$i18n.analytics.tracked_events}
					{/snippet}

					<p class="satellites">
						{$orbiterFeatures?.track_events === true ? $i18n.core.enabled : $i18n.core.disabled}
					</p>
				</Value>
			</div>

			<div>
				<Value>
					{#snippet label()}
						{$i18n.analytics.web_vitals}
					{/snippet}

					<p class="satellites">
						{$orbiterFeatures?.performance_metrics === true
							? $i18n.core.enabled
							: $i18n.core.disabled}
					</p>
				</Value>
			</div>
		</div>
	</div>
</div>

{#if $sortedSatellites.length > 0}
	<button onclick={openModal} in:fade>
		{$i18n.core.edit_config}
	</button>
{/if}

<style lang="scss">
	@use '../../styles/mixins/text';

	.satellites {
		@include text.clamp(3);
	}
</style>
