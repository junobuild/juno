<script lang="ts">
	import { fade } from 'svelte/transition';
	import { nonNullish } from '@dfinity/utils';
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { JunoModalDetail } from '$lib/types/modal';
	import MissionControlCreateWizard from '$lib/components/mission-control/create/MissionControlCreateWizard.svelte';
	import MonitoringCreateWizard from '$lib/components/monitoring/create/MonitoringCreateWizard.svelte';
	import { assertAndGetForMonitoringWizard } from '$lib/services/mission-control/monitoring.services';
	import type { MissionControlDid } from '$declarations';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let step = $state<'mission_control' | 'monitoring'>('mission_control');

	let onback = $state<(() => void) | undefined>();

	let user = $state<MissionControlDid.User | undefined>(undefined);
	let settings = $state<MissionControlDid.MissionControlSettings | undefined>(undefined);

	const oncontinue = () => {
		const result = assertAndGetForMonitoringWizard();

		// Rather unexpected since those store are reloaded in the last steps of the mission control create wizard
		if (result.valid === 'error') {
			onclose();
			return;
		}

		const { user: u, settings: s } = result;
		settings = s;
		user = u;

		step = 'monitoring';
	};
</script>

<Modal {onback} {onclose}>
	{#if step === 'monitoring' && nonNullish($missionControlId) && nonNullish(user)}
		<div in:fade>
			<MonitoringCreateWizard
				{settings}
				{user}
				missionControlId={$missionControlId}
				{onclose}
				bind:onback
			/>
		</div>
	{:else}
		<MissionControlCreateWizard {detail} {onclose} {oncontinue} />
	{/if}
</Modal>
