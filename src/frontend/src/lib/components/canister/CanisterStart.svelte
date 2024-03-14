<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import { authSignedInStore, authStore } from '$lib/stores/auth.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { busy } from '$lib/stores/busy.store';
	import { canisterStart } from '$lib/api/ic.api';
	import { emit } from '$lib/utils/events.utils';
	import IconStart from '$lib/components/icons/IconStart.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { CanisterIcStatus } from '$lib/types/canister';
	import { Principal } from '@dfinity/principal';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';
	import Text from '$lib/components/ui/Text.svelte';

	export let canister: CanisterIcStatus;
	export let segment: 'satellite' | 'orbiter';

	let visible = false;

	const dispatch = createEventDispatcher();

	const start = async () => {
		dispatch('junoStart');

		if (!$authSignedInStore) {
			toasts.error({
				text: $i18n.errors.no_identity
			});
			return;
		}

		busy.start();

		try {
			const canisterId = Principal.fromText(canister.id);

			await canisterStart({ canisterId, identity: $authStore.identity! });

			emit({ message: 'junoRestartCycles', detail: { canisterId } });
			emit({ message: 'junoReloadVersions' });

			close();

			toasts.success(
				i18nCapitalize(
					i18nFormat($i18n.canisters.start_success, [
						{
							placeholder: '{0}',
							value: segment
						}
					])
				)
			);
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

<button on:click={() => (visible = true)} class="menu"><IconStart /> {$i18n.core.start}</button>

<Confirmation bind:visible on:junoYes={start} on:junoNo={close}>
	<svelte:fragment slot="title">
		<Text key="canisters.start_tile" value={segment} /></svelte:fragment
	>

	<p><Text key="canisters.start_info" value={segment} /></p>
</Confirmation>
