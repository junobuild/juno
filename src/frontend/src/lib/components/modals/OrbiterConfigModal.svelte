<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import type { SvelteComponent } from 'svelte';
	import type { OrbiterSatelliteFeatures } from '$declarations/orbiter/orbiter.did';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { setOrbiterSatelliteConfigs } from '$lib/services/orbiters.services';
	import { authStore } from '$lib/stores/auth.store';
	import { isBusy, wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { orbitersConfigsStore } from '$lib/stores/orbiter-configs.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { JunoModalDetail, JunoModalEditOrbiterConfigDetail } from '$lib/types/modal';
	import type { OrbiterSatelliteConfigEntry } from '$lib/types/ortbiter';
	import type { SatelliteIdText } from '$lib/types/satellite';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let orbiterId: Principal = $state((detail as JunoModalEditOrbiterConfigDetail).orbiterId);

	let config: Record<SatelliteIdText, OrbiterSatelliteConfigEntry> = $state(
		(detail as JunoModalEditOrbiterConfigDetail).config
	);

	let features: OrbiterSatelliteFeatures | undefined = $state(
		(detail as JunoModalEditOrbiterConfigDetail).features
	);

	let steps: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	let collapsibleRef: (SvelteComponent & { open: () => void; close: () => void }) | undefined =
		$state(undefined);

	const openOptions = (features: OrbiterSatelliteFeatures | undefined) => {
		if (
			features?.page_views === false ||
			features?.track_events === false ||
			features?.performance_metrics === false
		) {
			collapsibleRef?.open();
		}
	};

	let mounted = false;

	$effect(() => {
		if (mounted) {
			return;
		}

		const features = (detail as JunoModalEditOrbiterConfigDetail).features;
		openOptions(features);

		mounted = true;
	});

	let featuresSupported = $derived(
		compare($versionStore.orbiter?.current ?? '0.0.0', '0.0.8') >= 0
	);

	const onPageViewsToggle = () => {
		features = {
			...(nonNullish(features)
				? features
				: { page_views: true, track_events: true, performance_metrics: true }),
			page_views: features?.page_views !== true
		};
	};

	const onTrackEventsToggle = () => {
		features = {
			...(nonNullish(features)
				? features
				: { page_views: true, track_events: true, performance_metrics: true }),
			track_events: features?.track_events !== true
		};
	};

	const onPerformanceToggle = () => {
		features = {
			...(nonNullish(features)
				? features
				: { page_views: true, track_events: true, performance_metrics: true }),
			performance_metrics: features?.performance_metrics !== true
		};
	};

	let validConfirm = $derived(Object.keys(config).length > 0);

	const handleSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (!validConfirm) {
			// Submit is disabled if not valid
			toasts.error({
				text: $i18n.errors.orbiter_configuration_missing
			});
			return;
		}

		if (isNullish($versionStore.orbiter?.current)) {
			toasts.error({
				text: $i18n.errors.missing_version
			});
			return;
		}

		wizardBusy.start();
		steps = 'in_progress';

		try {
			const results = await setOrbiterSatelliteConfigs({
				orbiterId,
				config,
				features,
				identity: $authStore.identity,
				orbiterVersion: $versionStore.orbiter.current
			});

			orbitersConfigsStore.setConfigs({
				orbiterId: orbiterId.toText(),
				configs: results
			});

			steps = 'ready';
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.orbiter_configuration_unexpected,
				detail: err
			});

			steps = 'init';
		}

		wizardBusy.stop();
	};
</script>

<Modal on:junoClose={onclose}>
	{#if steps === 'ready'}
		<div class="msg">
			<p>{$i18n.core.configuration_applied}</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.core.updating_configuration}</p>
		</SpinnerModal>
	{:else}
		<h2>{$i18n.core.config}</h2>

		<p>{$i18n.analytics.configuration_description}</p>

		<form class="content" onsubmit={handleSubmit}>
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th class="tools"> {$i18n.analytics.enabled} </th>
							<th class="origin"> {$i18n.satellites.satellite} </th>
							<th class="origin"> {$i18n.satellites.id} </th>
						</tr>
					</thead>
					<tbody>
						{#each Object.entries(config) as conf}
							{@const satelliteId = conf[0]}
							{@const entry = conf[1]}

							<tr>
								<td class="actions">
									<input type="checkbox" bind:checked={conf[1].enabled} />
								</td>

								<td>
									{entry.name}
								</td>

								<td>
									<Identifier identifier={satelliteId} shorten={false} small={false} />
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if featuresSupported}
				<div class="options">
					<Collapsible bind:this={collapsibleRef}>
						<svelte:fragment slot="header">{$i18n.core.advanced_options}</svelte:fragment>

						<div class="card-container with-title">
							<span class="title">{$i18n.analytics.tracked_metrics}</span>

							<div class="content">
								<div class="checkbox">
									<input
										type="checkbox"
										checked={isNullish(features) || features?.page_views === true}
										onchange={onPageViewsToggle}
									/>
									<span>{$i18n.analytics.page_views}</span>
								</div>

								<div class="checkbox">
									<input
										type="checkbox"
										checked={isNullish(features) || features?.track_events === true}
										onchange={onTrackEventsToggle}
									/>
									<span>{$i18n.analytics.tracked_events}</span>
								</div>

								<div class="checkbox">
									<input
										type="checkbox"
										checked={isNullish(features) || features?.performance_metrics === true}
										onchange={onPerformanceToggle}
									/>
									<span>{$i18n.analytics.web_vitals}</span>
								</div>
							</div>
						</div>
					</Collapsible>
				</div>
			{/if}

			<button type="submit" disabled={!validConfirm || $isBusy}>
				{$i18n.core.submit}
			</button>
		</form>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}

	.tools {
		width: 88px;
	}

	input[type='checkbox'] {
		margin: 0;
	}

	.checkbox {
		&:not(:first-of-type) {
			padding: var(--padding-2x) 0 0;
		}

		span {
			white-space: pre-wrap;
		}
	}

	.options {
		margin: var(--padding-6x) 0 0;
	}
</style>
