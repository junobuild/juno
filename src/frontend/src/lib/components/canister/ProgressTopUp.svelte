<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { type TopUpProgress, TopUpProgressStep } from '$lib/types/progress-topup';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		progress: TopUpProgress | undefined;
	}

	let { progress }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		topUp: ProgressStep;
		reload: ProgressStep;
	}

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.canisters.top_up_preparing
		},
		topUp: {
			state: 'next',
			step: 'top-up',
			text: $i18n.canisters.top_up_in_progress
		},
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
			const { preparing, topUp, reload } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				topUp: {
					...topUp,
					state:
						progress?.step === TopUpProgressStep.TopUp
							? mapProgressState(progress?.state)
							: topUp.state
				},
				reload: {
					...reload,
					state:
						progress?.step === TopUpProgressStep.Reload
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
