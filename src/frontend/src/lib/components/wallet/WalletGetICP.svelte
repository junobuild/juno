<script lang="ts">
	import ConfettiSpread from '$lib/components/ui/ConfettiSpread.svelte';
	import { DEV } from '$lib/constants/app.constants';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	let confetti = $state(false);

	const onClick = async () => {
		await fetch(`http://localhost:5999/ledger/transfer/?to=${missionControlId.toText()}`);

		emit({ message: 'junoRestartWallet' });

		confetti = true;

		setTimeout(() => (confetti = false), 5000);
	};
</script>

{#if DEV}
	{#if confetti}
		<ConfettiSpread />
	{/if}

	<button onclick={onClick}>{$i18n.wallet.dev_get_icp}</button>
{/if}
