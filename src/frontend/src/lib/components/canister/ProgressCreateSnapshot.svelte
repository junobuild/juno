<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { type CreateSnapshotProgress, CreateSnapshotProgressStep } from '$lib/types/snapshot';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		segment: 'satellite' | 'mission_control' | 'orbiter';
		progress: CreateSnapshotProgress | undefined;
	}

	let { progress, segment }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		stopping: ProgressStep;
		creating: ProgressStep;
		restarting: ProgressStep;
	}

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.canisters.backup_preparing
		},
		stopping: {
			state: 'next',
			step: 'stopping',
			text: i18nFormat($i18n.canisters.backup_stopping, [
				{
					placeholder: '{0}',
					value: segment
				}
			])
		},
		creating: {
			state: 'next',
			step: 'creating',
			text: $i18n.canisters.creating_backup
		},
		restarting: {
			state: 'next',
			step: 'restarting',
			text: i18nFormat($i18n.canisters.upgrade_restarting, [
				{
					placeholder: '{0}',
					value: segment
				}
			])
		}
	});

	let displaySteps = $derived(Object.values(steps) as [ProgressStep, ...ProgressStep[]]);

	$effect(() => {
		progress;

		untrack(() => {
			const { preparing, stopping, creating, restarting } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				stopping: {
					...stopping,
					state:
						progress?.step === CreateSnapshotProgressStep.StoppingCanister
							? mapProgressState(progress?.state)
							: stopping.state
				},
				creating: {
					...creating,
					state:
						progress?.step === CreateSnapshotProgressStep.CreatingSnapshot
							? mapProgressState(progress?.state)
							: creating.state
				},
				restarting: {
					...restarting,
					state:
						progress?.step === CreateSnapshotProgressStep.RestartingCanister
							? mapProgressState(progress?.state)
							: restarting.state
				}
			};
		});
	});
</script>

<WizardProgressSteps steps={displaySteps}>
	{$i18n.core.hold_tight}
</WizardProgressSteps>
