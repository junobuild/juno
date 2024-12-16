<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProgressStep } from '$lib/types/progress-step';
	import {
		type MonitoringStrategyProgress,
		MonitoringStrategyProgressStep
	} from '$lib/types/strategy';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		progress: MonitoringStrategyProgress | undefined;
	}

	let { progress }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		createAndStart: ProgressStep;
		reload: ProgressStep;
	}

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.monitoring.strategy_preparing
		},
		createAndStart: {
			state: 'next',
			step: 'create_and_start',
			text: $i18n.monitoring.applying_strategy
		},
		reload: {
			state: 'next',
			step: 'reload',
			text: $i18n.monitoring.reload_settings
		}
	});

	let displaySteps = $derived(Object.values(steps) as [ProgressStep, ...ProgressStep[]]);

	$effect(() => {
		progress;

		untrack(() => {
			const { preparing, createAndStart, reload } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				createAndStart: {
					...createAndStart,
					state:
						progress?.step === MonitoringStrategyProgressStep.CreateAndStartMonitoring
							? mapProgressState(progress?.state)
							: createAndStart.state
				},
				reload: {
					...reload,
					state:
						progress?.step === MonitoringStrategyProgressStep.ReloadSettings
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
