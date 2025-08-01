<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { assertNonNullish } from '@dfinity/utils';
	import { canisterStart } from '$lib/api/ic.api';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import IconStart from '$lib/components/icons/IconStart.svelte';
	import Text from '$lib/components/ui/Text.svelte';
	import { authSignedOut } from '$lib/derived/auth.derived';
	import { reloadOrbiterVersion } from '$lib/services/version/version.orbiter.services';
	import { reloadSatelliteVersion } from '$lib/services/version/version.satellite.services';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSyncData } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		canister: CanisterSyncData;
		segment: 'satellite' | 'orbiter';
		onstart: () => void;
	}

	let { canister, segment, onstart }: Props = $props();

	let visible = $state(false);

	const start = async () => {
		onstart();

		if ($authSignedOut) {
			toasts.error({
				text: $i18n.errors.no_identity
			});
			return;
		}

		busy.start();

		try {
			const canisterId = Principal.fromText(canister.id);

			assertNonNullish($authStore.identity);

			await canisterStart({ canisterId, identity: $authStore.identity });

			emit({ message: 'junoRestartCycles', detail: { canisterId } });

			// Reload version
			switch (segment) {
				case 'orbiter': {
					await reloadOrbiterVersion({
						orbiterId: canisterId
					});

					break;
				}
				case 'satellite': {
					await reloadSatelliteVersion({
						satelliteId: canisterId
					});

					break;
				}
			}

			close();

			toasts.success({
				text: i18nCapitalize(
					i18nFormat($i18n.canisters.start_success, [
						{
							placeholder: '{0}',
							value: segment
						}
					])
				)
			});
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.canister_start,
				detail: err
			});
		}

		busy.stop();
	};

	const close = () => (visible = false);
</script>

<button class="menu" onclick={() => (visible = true)}><IconStart /> {$i18n.core.start}</button>

<Confirmation bind:visible on:junoYes={start} on:junoNo={close}>
	{#snippet title()}
		<Text key="canisters.start_tile" value={segment} />
	{/snippet}

	<p><Text key="canisters.start_info" value={segment} /></p>
</Confirmation>
