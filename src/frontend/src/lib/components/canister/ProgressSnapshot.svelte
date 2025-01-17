<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { type SnapshotProgress, SnapshotProgressStep } from '$lib/types/progress-snapshot';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		segment: 'satellite' | 'mission_control' | 'orbiter';
		progress: SnapshotProgress | undefined;
		snapshotAction: 'create' | 'restore';
	}

	let { progress, segment, snapshotAction }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		stopping: ProgressStep;
		createOrRestore: ProgressStep;
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
					value: segment.replace('_', ' ')
				}
			])
		},
		createOrRestore: {
			state: 'next',
			step: 'create_or_restore',
			text:
				snapshotAction === 'restore'
					? $i18n.canisters.restoring_backup
					: $i18n.canisters.creating_backup
		},
		restarting: {
			state: 'next',
			step: 'restarting',
			text: i18nFormat($i18n.canisters.upgrade_restarting, [
				{
					placeholder: '{0}',
					value: segment.replace('_', ' ')
				}
			])
		}
	});

	let displaySteps = $derived(Object.values(steps) as [ProgressStep, ...ProgressStep[]]);

	$effect(() => {
		progress;

		untrack(() => {
			const { preparing, stopping, createOrRestore, restarting } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				stopping: {
					...stopping,
					state:
						progress?.step === SnapshotProgressStep.StoppingCanister
							? mapProgressState(progress?.state)
							: stopping.state
				},
				createOrRestore: {
					...createOrRestore,
					state:
						progress?.step === SnapshotProgressStep.CreateOrRestoreSnapshot
							? mapProgressState(progress?.state)
							: createOrRestore.state
				},
				restarting: {
					...restarting,
					state:
						progress?.step === SnapshotProgressStep.RestartingCanister
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
