<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { goto } from '$app/navigation';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import IconLinkOff from '$lib/components/icons/IconLinkOff.svelte';
	import Text from '$lib/components/ui/Text.svelte';
	import { missionControlStore } from '$lib/derived/mission-control.derived';
	import { detachOrbiter, detachSatellite } from '$lib/services/mission-control.services';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store.js';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		segment: 'satellite' | 'orbiter';
		segmentId: Principal;
		ondetach: () => void;
	}

	let { segment, segmentId, ondetach }: Props = $props();

	let visible = $state(false);

	const detach = async () => {
		ondetach();

		if (!$authSignedInStore) {
			toasts.error({
				text: $i18n.errors.no_identity
			});
			return;
		}

		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		busy.start();

		try {
			const fn = segment === 'orbiter' ? detachOrbiter : detachSatellite;

			await fn({
				canisterId: segmentId,
				missionControlId: $missionControlStore
			});

			await goto('/', { replaceState: true });

			close();

			toasts.success(
				i18nCapitalize(
					i18nFormat($i18n.canisters.detach_success, [
						{
							placeholder: '{0}',
							value: segment
						}
					])
				)
			);
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
