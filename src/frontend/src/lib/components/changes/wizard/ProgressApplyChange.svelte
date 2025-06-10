<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { type ApplyProposalProgress, ApplyProposalProgressStep } from '@junobuild/cdn';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		progress: ApplyProposalProgress | undefined;
		takeSnapshot?: boolean;
		clearProposalAssets?: boolean;
	}

	let { progress, takeSnapshot = false, clearProposalAssets = true }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		snapshotting?: ProgressStep;
		applying: ProgressStep;
		clearing?: ProgressStep;
		reload: ProgressStep;
	}

	const snapshottingStep: ProgressStep = {
		state: 'next',
		step: 'snapshotting',
		text: $i18n.core.creating_snapshot
	};

	const clearingStep: ProgressStep = {
		state: 'next',
		step: 'clearing',
		text: $i18n.changes.clearing_staged_assets
	};

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.changes.change_preparing
		},
		...(takeSnapshot && { snapshottingStep }),
		applying: {
			state: 'next',
			step: 'applying',
			text: $i18n.changes.applying_update
		},
		...(clearProposalAssets && { clearingStep }),
		reload: {
			state: 'next',
			step: 'reload',
			text: $i18n.core.refreshing_interface
		}
	});

	let displaySteps = $derived(Object.values(steps) as [ProgressStep, ...ProgressStep[]]);

	$effect(() => {
		progress;

		untrack(() => {
			const { preparing, snapshotting, applying, clearing, reload } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				...(takeSnapshot && {
					snapshotting: {
						...(snapshotting ?? snapshottingStep),
						state:
							progress?.step === ApplyProposalProgressStep.TakingSnapshot
								? mapProgressState(progress?.state)
								: (snapshotting?.state ?? snapshottingStep.state)
					}
				}),
				applying: {
					...applying,
					state:
						progress?.step === ApplyProposalProgressStep.CommittingProposal
							? mapProgressState(progress?.state)
							: applying.state
				},
				...(clearProposalAssets && {
					clearing: {
						...(clearing ?? clearingStep),
						state:
							progress?.step === ApplyProposalProgressStep.ClearingProposalAssets
								? mapProgressState(progress?.state)
								: (clearing?.state ?? clearingStep.state)
					}
				}),
				reload: {
					...reload,
					state:
						progress?.step === ApplyProposalProgressStep.CleaningUp
							? mapProgressState(progress?.state)
							: reload.state
				}
			};
		});
	});
</script>

<WizardProgressSteps steps={displaySteps}>
	{$i18n.core.hold_tight}
</WizardProgressSteps>
