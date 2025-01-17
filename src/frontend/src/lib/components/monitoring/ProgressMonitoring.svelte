<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProgressStep } from '$lib/types/progress-step';
	import {
		type MonitoringStrategyProgress,
		MonitoringStrategyProgressStep
	} from '$lib/types/progress-strategy';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		progress: MonitoringStrategyProgress | undefined;
		action: 'create' | 'stop';
		withOptions?: boolean;
	}

	let { progress, action, withOptions = false }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		options?: ProgressStep;
		apply: ProgressStep;
		reload: ProgressStep;
	}

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.monitoring.strategy_preparing
		},
		...(withOptions === true && {
			options: {
				state: 'next',
				step: 'options',
				text: $i18n.monitoring.saving_options
			}
		}),
		apply: {
			state: 'next',
			step: 'create_and_start',
			text:
				action === 'stop'
					? $i18n.monitoring.stopping_auto_refill
					: $i18n.monitoring.starting_auto_refill
		},
		reload: {
			state: 'next',
			step: 'reload',
			text: $i18n.monitoring.reload_data
		}
	});

	let displaySteps = $derived(Object.values(steps) as [ProgressStep, ...ProgressStep[]]);

	$effect(() => {
		progress;

		untrack(() => {
			const { preparing, apply, reload, options } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				...(nonNullish(options) && {
					options: {
						...options,
						state:
							progress?.step === MonitoringStrategyProgressStep.Options
								? mapProgressState(progress?.state)
								: options.state
					}
				}),
				apply: {
					...apply,
					state:
						progress?.step === MonitoringStrategyProgressStep.CreateOrStopMonitoring
							? mapProgressState(progress?.state)
							: apply.state
				},
				reload: {
					...reload,
					state:
						progress?.step === MonitoringStrategyProgressStep.Reload
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
