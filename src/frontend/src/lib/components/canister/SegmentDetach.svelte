<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { goto } from '$app/navigation';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import IconLinkOff from '$lib/components/icons/IconLinkOff.svelte';
	import Text from '$lib/components/ui/Text.svelte';
	import { authSignedOut } from '$lib/derived/auth.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { detachOrbiter, detachSatellite } from '$lib/services/mission-control.services';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		segment: 'satellite' | 'orbiter';
		monitoringEnabled: boolean;
		segmentId: Principal;
		ondetach: () => void;
	}

	let { segment, monitoringEnabled, segmentId, ondetach }: Props = $props();

	let visible = $state(false);

	const detach = async () => {
		ondetach();

		if ($authSignedOut) {
			toasts.error({
				text: $i18n.errors.no_identity
			});
			return;
		}

		if (isNullish($missionControlIdDerived)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		// TODO: can be removed once the mission control is patched to disable monitoring on detach
		if (monitoringEnabled) {
			toasts.warn($i18n.monitoring.warn_monitoring_enabled);
			return;
		}

		busy.start();

		try {
			const fn = segment === 'orbiter' ? detachOrbiter : detachSatellite;

			await fn({
				canisterId: segmentId,
				missionControlId: $missionControlIdDerived
			});

			await goto('/', { replaceState: true });

			close();

			toasts.success({
				text: i18nCapitalize(
					i18nFormat($i18n.canisters.detach_success, [
						{
							placeholder: '{0}',
							value: segment
						}
					])
				)
			});
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.segment_detach,
				detail: err
			});
		}

		busy.stop();
	};

	const close = () => (visible = false);
</script>

<button onclick={() => (visible = true)} class="menu"><IconLinkOff /> {$i18n.core.detach}</button>

<Confirmation bind:visible on:junoYes={detach} on:junoNo={close}>
	{#snippet title()}
		<Text key="canisters.detach_title" value={segment} />
	{/snippet}

	<p><Text key="canisters.detach_explanation" value={segment} /></p>

	<p><Text key="canisters.detach_info" value={segment} /></p>
</Confirmation>
