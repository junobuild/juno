<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { isSkylab } from '$lib/env/app.env';
	import { i18n } from '$lib/stores/app/i18n.store';
	import {
		type FactoryCreateProgress,
		FactoryCreateProgressStep
	} from '$lib/types/progress-factory-create';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		progress: FactoryCreateProgress | undefined;
		segment: 'satellite' | 'mission_control' | 'orbiter';
		withApprove: boolean;
		withMonitoring?: boolean;
		withAttach?: boolean;
		attachProgressText?: string;
	}

	let {
		progress,
		segment,
		withApprove,
		withMonitoring = false,
		withAttach = false,
		attachProgressText
	}: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		approve?: ProgressStep;
		create: ProgressStep;
		attaching?: ProgressStep;
		monitoring?: ProgressStep;
		finalizing?: ProgressStep;
		reload: ProgressStep;
	}

	let defaultAttachProgressText = $derived(`${$i18n.mission_control.attaching}...`);

	// svelte-ignore state_referenced_locally
	let steps = $state<Steps>({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.core.preparing
		},
		...(withApprove && {
			approve: {
				state: 'next',
				step: 'approve',
				text: $i18n.wallet.approving_canister_fee
			}
		}),
		create: {
			state: 'next',
			step: 'create',
			text:
				segment === 'mission_control'
					? $i18n.mission_control.initializing
					: segment === 'orbiter'
						? $i18n.analytics.initializing
						: $i18n.satellites.initializing
		},
		...(withAttach === true && {
			attaching: {
				state: 'next',
				step: 'attaching',
				text:
					segment === 'mission_control'
						? (attachProgressText ?? defaultAttachProgressText)
						: segment === 'orbiter'
							? $i18n.analytics.attaching
							: $i18n.satellites.attaching
			}
		}),
		...(withMonitoring === true && {
			monitoring: {
				state: 'next',
				step: 'monitoring',
				text: $i18n.monitoring.starting_auto_refill
			}
		}),
		...(isSkylab() &&
			segment === 'satellite' && {
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
			const { preparing, approve, create, attaching, monitoring, finalizing, reload } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				...(nonNullish(approve) && {
					approve: {
						...approve,
						state:
							progress?.step === FactoryCreateProgressStep.Approve
								? mapProgressState(progress?.state)
								: approve.state
					}
				}),
				create: {
					...create,
					state:
						progress?.step === FactoryCreateProgressStep.Create
							? mapProgressState(progress?.state)
							: create.state
				},
				...(nonNullish(attaching) && {
					attaching: {
						...attaching,
						state:
							progress?.step === FactoryCreateProgressStep.Attaching
								? mapProgressState(progress?.state)
								: attaching.state
					}
				}),
				...(nonNullish(monitoring) && {
					monitoring: {
						...monitoring,
						state:
							progress?.step === FactoryCreateProgressStep.Monitoring
								? mapProgressState(progress?.state)
								: monitoring.state
					}
				}),
				...(nonNullish(finalizing) && {
					finalizing: {
						...finalizing,
						state:
							progress?.step === FactoryCreateProgressStep.Finalizing
								? mapProgressState(progress?.state)
								: finalizing.state
					}
				}),
				reload: {
					...reload,
					state:
						progress?.step === FactoryCreateProgressStep.Reload
							? mapProgressState(progress?.state)
							: reload.state
				}
			};
		});
	});

	$effect(() => {
		attachProgressText;
		defaultAttachProgressText;

		untrack(() => {
			const { attaching, monitoring, finalizing, reload, ...rest } = steps;

			steps = {
				...rest,
				...(nonNullish(attaching) && {
					attaching: {
						...attaching,
						text: attachProgressText ?? defaultAttachProgressText
					}
				}),
				...(nonNullish(monitoring) && {
					monitoring
				}),
				...(nonNullish(finalizing) && {
					finalizing
				}),
				reload
			};
		});
	});
</script>

<WizardProgressSteps steps={displaySteps}>
	{$i18n.core.hold_tight}
</WizardProgressSteps>
