<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { type RejectProposalProgress, RejectProposalProgressStep } from '@junobuild/cdn';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		progress: RejectProposalProgress | undefined;
		clearProposalAssets?: boolean;
	}

	let { progress, clearProposalAssets = true }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		rejecting: ProgressStep;
		clearing?: ProgressStep;
		reload: ProgressStep;
	}

	const clearingStep: ProgressStep = {
		state: 'next',
		step: 'clearing',
		text: $i18n.changes.clearing_staged_assets
	};

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.changes.reject_preparing
		},
		rejecting: {
			state: 'next',
			step: 'rejecting',
			text: $i18n.changes.rejecting
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
			const { preparing, rejecting, clearing, reload } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				rejecting: {
					...rejecting,
					state:
						progress?.step === RejectProposalProgressStep.RejectingProposal
							? mapProgressState(progress?.state)
							: rejecting.state
				},
				...(clearProposalAssets && {
					clearing: {
						...(clearing ?? clearingStep),
						state:
							progress?.step === RejectProposalProgressStep.ClearingProposalAssets
								? mapProgressState(progress?.state)
								: (clearing?.state ?? clearingStep.state)
					}
				}),
				reload: {
					...reload,
					state:
						progress?.step === RejectProposalProgressStep.PostReject
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
