<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { type UpgradeCodeProgress, UpgradeCodeProgressStep } from '@junobuild/admin';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		segment: 'satellite' | 'mission_control' | 'orbiter';
		progress: UpgradeCodeProgress | undefined;
		takeSnapshot?: boolean;
	}

	let { progress, segment, takeSnapshot = true }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		asserting: ProgressStep;
		stopping: ProgressStep;
		snapshotting?: ProgressStep;
		upgrading: ProgressStep;
		restarting: ProgressStep;
	}

	const snapshottingStep: ProgressStep = {
		state: 'next',
		step: 'snapshotting',
		text: $i18n.canisters.upgrade_snapshot
	};

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.canisters.upgrade_preparing
		},
		asserting: {
			state: 'next',
			step: 'asserting',
			text: $i18n.canisters.upgrade_validating
		},
		stopping: {
			state: 'next',
			step: 'stopping',
			text: i18nFormat($i18n.canisters.upgrade_stopping, [
				{
					placeholder: '{0}',
					value: segment.replace('_', ' ')
				}
			])
		},
		...(takeSnapshot && { snapshottingStep }),
		upgrading: {
			state: 'next',
			step: 'upgrading',
			text: $i18n.canisters.upgrade_in_progress
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
			const { preparing, asserting, stopping, snapshotting, upgrading, restarting } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				asserting: {
					...asserting,
					state:
						progress?.step === UpgradeCodeProgressStep.AssertingExistingCode
							? mapProgressState(progress?.state)
							: asserting.state
				},
				stopping: {
					...stopping,
					state:
						progress?.step === UpgradeCodeProgressStep.StoppingCanister
							? mapProgressState(progress?.state)
							: stopping.state
				},
				...(takeSnapshot && {
					snapshotting: {
						...(snapshotting ?? snapshottingStep),
						state:
							progress?.step === UpgradeCodeProgressStep.TakingSnapshot
								? mapProgressState(progress?.state)
								: (snapshotting?.state ?? snapshottingStep.state)
					}
				}),
				upgrading: {
					...upgrading,
					state:
						progress?.step === UpgradeCodeProgressStep.UpgradingCode
							? mapProgressState(progress?.state)
							: upgrading.state
				},
				restarting: {
					...restarting,
					state:
						progress?.step === UpgradeCodeProgressStep.RestartingCanister
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
