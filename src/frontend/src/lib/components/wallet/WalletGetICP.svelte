<script lang="ts">
	import ConfettiSpread from '$lib/components/ui/ConfettiSpread.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { isDev } from '$lib/env/app.env';
	import { emulatorLedgerTransfer } from '$lib/rest/emulator.rest';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { emit } from '$lib/utils/events.utils';
	import { testId } from '$lib/utils/test.utils';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	let confetti = $state(false);

	const onClick = async () => {
		await emulatorLedgerTransfer({ missionControlId });

		emit({ message: 'junoRestartWallet' });

		confetti = true;

		setTimeout(() => (confetti = false), 5000);
	};
</script>

{#if isDev()}
	{#if confetti}
		<ConfettiSpread />
	{/if}

	<button onclick={onClick} {...testId(testIds.wallet.getIcp)}>{$i18n.emulator.get_icp}</button>
{/if}
