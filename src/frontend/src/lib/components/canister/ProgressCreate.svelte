<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { type WizardCreateProgress, WizardCreateProgressStep } from '$lib/types/progress-wizard';
	import { mapProgressState } from '$lib/utils/progress.utils';

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
		reload: ProgressStep;
	}

	let steps: Steps = $state({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.monitoring.strategy_preparing
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
		reload: {
			state: 'next',
			step: 'reload',
			text: $i18n.canisters.loading_ui_data
		}
	});

	let displaySteps = $derived(Object.values(steps) as [ProgressStep, ...ProgressStep[]]);

	$effect(() => {
		progress;

		untrack(() => {
			const { preparing, create, monitoring, reload } = steps;

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
