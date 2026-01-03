<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import { goto } from '$app/navigation';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import IconLinkOff from '$lib/components/icons/IconLinkOff.svelte';
	import Text from '$lib/components/ui/Text.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { busy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';
	import { detachSegment } from '$lib/services/attach-detach/detach.services';

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

		busy.start();

		const { result } = await detachSegment({
			segmentId,
			segment,
			monitoringEnabled,
			missionControlId: $missionControlId,
			identity: $authIdentity
		});

		busy.stop();

		if (result === 'error' || result === 'warn') {
			return;
		}

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
	};

	const close = () => (visible = false);
</script>

<button class="menu" onclick={() => (visible = true)}><IconLinkOff /> {$i18n.core.detach}</button>

<Confirmation bind:visible on:junoYes={detach} on:junoNo={close}>
	{#snippet title()}
		<Text key="canisters.detach_title" value={segment} />
	{/snippet}

	<p><Text key="canisters.detach_explanation" value={segment} /></p>

	<p><Text key="canisters.detach_info" value={segment} /></p>
</Confirmation>
