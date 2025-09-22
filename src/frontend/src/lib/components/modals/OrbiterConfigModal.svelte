<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import type { OrbiterSatelliteFeatures } from '$declarations/orbiter/orbiter.did';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import CheckboxGroup from '$lib/components/ui/CheckboxGroup.svelte';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { DEFAULT_FEATURES } from '$lib/constants/analytics.constants';
	import { ORBITER_v0_0_8 } from '$lib/constants/version.constants';
	import { setOrbiterSatelliteConfigs } from '$lib/services/orbiter/orbiters.services';
	import { authStore } from '$lib/stores/auth.store';
	import { isBusy, wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { orbitersConfigsStore } from '$lib/stores/orbiter-configs.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { JunoModalDetail, JunoModalEditOrbiterConfigDetail } from '$lib/types/modal';
	import type { OrbiterSatelliteConfigEntry } from '$lib/types/orbiter';
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

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	let collapsibleRef: Collapsible | undefined = $state(undefined);

	const openOptions = (features: OrbiterSatelliteFeatures | undefined) => {
		if (
			features?.page_views === false ||
			features?.track_events === false ||
			features?.performance_metrics === true
		) {
			collapsibleRef?.open();
		}
	};

	let mounted = false;

	$effect(() => {
		if (mounted) {
			return;
		}

		const { features } = detail as JunoModalEditOrbiterConfigDetail;
		openOptions(features);

		mounted = true;
	});

	let featuresSupported = $derived(
		compare($versionStore.orbiter?.current ?? '0.0.0', ORBITER_v0_0_8) >= 0
	);

	const onPageViewsToggle = () => {
		features = {
			...(nonNullish(features) ? features : DEFAULT_FEATURES),
			page_views: features?.page_views !== true
		};
	};

	const onTrackEventsToggle = () => {
		features = {
			...(nonNullish(features) ? features : DEFAULT_FEATURES),
			track_events: features?.track_events !== true
		};
	};

	const onPerformanceToggle = () => {
		features = {
			...(nonNullish(features) ? features : DEFAULT_FEATURES),
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
		step = 'in_progress';

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

			step = 'ready';
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.orbiter_configuration_unexpected,
				detail: err
			});

			step = 'init';
		}

		wizardBusy.stop();
	};
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<div class="msg">
			<p>{$i18n.core.configuration_applied}</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
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
							<th class="tools"> {$i18n.core.enabled} </th>
							<th class="origin"> {$i18n.satellites.satellite} </th>
							<th class="origin"> {$i18n.satellites.id} </th>
						</tr>
					</thead>
					<tbody>
						{#each Object.entries(config) as conf (conf[0])}
							{@const [satelliteId, entry] = conf}

							<tr>
								<td class="actions">
									<Checkbox>
										<input id={satelliteId} type="checkbox" bind:checked={conf[1].enabled} />
									</Checkbox>
								</td>

								<td>
									<label for={satelliteId}>{entry.name}</label>
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
						{#snippet header()}
							{$i18n.core.advanced_options}
						{/snippet}

						<div class="card-container with-title">
							<span class="title">{$i18n.analytics.tracked_metrics}</span>

							<div class="content">
								<CheckboxGroup>
									<Checkbox>
										<label>
											<input
												checked={isNullish(features) || features?.page_views === true}
												onchange={onPageViewsToggle}
												type="checkbox"
											/>
											<span>{$i18n.analytics.page_views}</span>
										</label>
									</Checkbox>

									<Checkbox>
										<label>
											<input
												checked={isNullish(features) || features?.track_events === true}
												onchange={onTrackEventsToggle}
												type="checkbox"
											/>
											<span>{$i18n.analytics.tracked_events}</span>
										</label>
									</Checkbox>

									<Checkbox>
										<label
											><input
												checked={features?.performance_metrics === true}
												onchange={onPerformanceToggle}
												type="checkbox"
											/>
											<span>{$i18n.analytics.web_vitals}</span></label
										>
									</Checkbox>
								</CheckboxGroup>
							</div>
						</div>
					</Collapsible>
				</div>
			{/if}

			<button disabled={!validConfirm || $isBusy} type="submit">
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

	.options {
		margin: var(--padding-6x) 0 0;
	}
</style>
