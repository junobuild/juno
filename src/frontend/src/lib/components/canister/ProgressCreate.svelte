<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { type WizardCreateProgress, WizardCreateProgressStep } from '$lib/types/progress-wizard';
	import { mapProgressState } from '$lib/utils/progress.utils';
	import { isSkylab } from '$lib/env/app.env';

	interface Props {
		progress: WizardCreateProgress | undefined;
		segment: 'satellite' | 'orbiter';
		withMonitoring?: boolean;
	}

	let { progress, segment, withMonitoring = false }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		create: ProgressStep;
		monitoring?: ProgressStep;
		finalizing?: ProgressStep;
		reload: ProgressStep;
	}

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.core.preparing
		},
		create: {
			state: 'next',
			step: 'create',
			text: segment === 'orbiter' ? $i18n.analytics.initializing : $i18n.satellites.initializing
		},
		...(withMonitoring === true && {
			monitoring: {
				state: 'next',
				step: 'monitoring',
				text: $i18n.monitoring.starting_auto_refill
			}
		}),
		...(isSkylab() && {
			finalizing: {
				state: 'next',
				step: 'finalizing',
				text: $i18n.emulator.setting_emulator_controller
			}
		}),
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
			const { preparing, create, monitoring, finalizing, reload } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				create: {
					...create,
					state:
						progress?.step === WizardCreateProgressStep.Create
							? mapProgressState(progress?.state)
							: create.state
				},
				...(nonNullish(monitoring) && {
					monitoring: {
						...monitoring,
						state:
							progress?.step === WizardCreateProgressStep.Monitoring
								? mapProgressState(progress?.state)
								: monitoring.state
					}
				}),
				...(nonNullish(finalizing) && {
					finalizing: {
						...finalizing,
						state:
							progress?.step === WizardCreateProgressStep.Finalizing
								? mapProgressState(progress?.state)
								: finalizing.state
					}
				}),
				reload: {
					...reload,
					state:
						progress?.step === WizardCreateProgressStep.Reload
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
