<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import { run, preventDefault } from 'svelte/legacy';
	import { setOrbiterSatelliteConfigs } from '$lib/services/orbiters.services';
	import { authStore } from '$lib/stores/auth.store';
	import { busy, isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { OrbiterSatelliteConfigEntry } from '$lib/types/ortbiter';
	import type { SatelliteIdText } from '$lib/types/satellite';

	interface Props {
		orbiterId: Principal;
		config: Record<SatelliteIdText, OrbiterSatelliteConfigEntry>;
	}

	let { orbiterId, config }: Props = $props();

	let validConfirm = $state(false);
	run(() => {
		validConfirm = Object.keys(config).length > 0;
	});

	const dispatch = createEventDispatcher();

	const handleSubmit = async () => {
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

		busy.start();

		try {
			const results = await setOrbiterSatelliteConfigs({
				orbiterId,
				config,
				identity: $authStore.identity,
				orbiterVersion: $versionStore.orbiter.current
			});

			dispatch('junoConfigUpdate', results);
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.orbiter_configuration_unexpected,
				detail: err
			});
		}

		busy.stop();
	};
</script>

<form class="container" onsubmit={preventDefault(handleSubmit)}>
	<button type="submit" class="submit" disabled={$isBusy || !validConfirm}>
		{$i18n.core.configure}
	</button>
</form>

<style lang="scss">
	button {
		margin: 0;
	}
</style>
