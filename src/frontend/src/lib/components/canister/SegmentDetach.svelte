<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store.js';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import type { Principal } from '@dfinity/principal';
	import IconLinkOff from '$lib/components/icons/IconLinkOff.svelte';
	import Text from '$lib/components/ui/Text.svelte';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';
	import { createEventDispatcher } from 'svelte';
	import { detachOrbiter, detachSatellite } from '$lib/services/mission-control.services';
	import { isNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { goto } from '$app/navigation';

	export let segment: 'satellite' | 'orbiter';
	export let segmentId: Principal;

	let visible = false;

	const dispatch = createEventDispatcher();

	const detach = async () => {
		dispatch('junoDetach');

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

<button on:click={() => (visible = true)} class="menu"><IconLinkOff /> {$i18n.core.detach}</button>

<Confirmation bind:visible on:junoYes={detach} on:junoNo={close}>
	<svelte:fragment slot="title"
		><Text key="canisters.detach_title" value={segment} /></svelte:fragment
	>

	<p><Text key="canisters.detach_explanation" value={segment} /></p>

	<p><Text key="canisters.detach_info" value={segment} /></p>
</Confirmation>
