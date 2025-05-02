<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { canisterStop } from '$lib/api/ic.api';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import IconStop from '$lib/components/icons/IconStop.svelte';
	import Text from '$lib/components/ui/Text.svelte';
	import { authSignedOut } from '$lib/derived/auth.derived';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSyncData } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		canister: CanisterSyncData;
		monitoringEnabled: boolean;
		segment: 'satellite' | 'orbiter';
		onstop: () => void;
	}

	let { canister, monitoringEnabled, segment, onstop }: Props = $props();

	let visible = $state(false);

	const stop = async () => {
		onstop();

		if ($authSignedOut) {
			toasts.error({
				text: $i18n.errors.no_identity
			});
			return;
		}

		if (monitoringEnabled) {
			toasts.warn($i18n.monitoring.warn_monitoring_enabled);
			return;
		}

		busy.start();

		try {
			const canisterId = Principal.fromText(canister.id);

			await canisterStop({ canisterId, identity: $authStore.identity! });

			emit({ message: 'junoRestartCycles', detail: { canisterId } });

			close();

			toasts.success({
				text: i18nCapitalize(
					i18nFormat($i18n.canisters.stop_success, [
						{
							placeholder: '{0}',
							value: segment
						}
					])
				)
			});
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.canister_stop,
				detail: err
			});
		}

		busy.stop();
	};

	const close = () => (visible = false);
</script>

<button onclick={() => (visible = true)} class="menu"><IconStop /> {$i18n.core.stop}</button>

<Confirmation bind:visible on:junoYes={stop} on:junoNo={close}>
	{#snippet title()}
		<Text key="canisters.stop_title" value={segment} />
	{/snippet}

	<p><Text key="canisters.stop_forewords" value={segment} /></p>

	<p><Text key="canisters.stop_explanation" value={segment} /></p>

	<p><Text key="canisters.stop_error" value={segment} /></p>

	<p><Text key="canisters.stop_info" value={segment} /></p>
</Confirmation>
