<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { untrack } from 'svelte';
	import WizardProgressSteps from '$lib/components/ui/WizardProgressSteps.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import {
		type FactoryDeleteProgress,
		FactoryDeleteProgressStep
	} from '$lib/types/progress-factory-delete';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';
	import { mapProgressState } from '$lib/utils/progress.utils';

	interface Props {
		segment: 'satellite' | 'analytics';
		progress: FactoryDeleteProgress | undefined;
	}

	let { progress, segment }: Props = $props();

	interface Steps {
		preparing: ProgressStep;
		deposit: ProgressStep;
		stopping: ProgressStep;
		deleting: ProgressStep;
		detaching: ProgressStep;
		reload: ProgressStep;
	}

	let segmentText = $derived(i18nCapitalize(segment.replace('_', ' ')));

	// svelte-ignore state_referenced_locally
	let steps = $state<Steps>({
		preparing: {
			state: 'in_progress',
			step: 'preparing',
			text: $i18n.core.preparing
		},
		deposit: {
			state: 'next',
			step: 'deposit',
			text: $i18n.canisters.depositing_cycles
		},
		stopping: {
			state: 'next',
			step: 'stopping',
			text: i18nFormat($i18n.canisters.stopping, [
				{
					placeholder: '{0}',
					value: segmentText
				}
			])
		},
		deleting: {
			state: 'next',
			step: 'deleting',
			text: i18nFormat($i18n.canisters.deleting, [
				{
					placeholder: '{0}',
					value: segmentText
				}
			])
		},
		detaching: {
			state: 'next',
			step: 'detaching',
			text: i18nFormat($i18n.canisters.detaching, [
				{
					placeholder: '{0}',
					value: segmentText
				}
			])
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
			const { preparing, deposit, stopping, deleting, detaching, reload } = steps;

			steps = {
				preparing: {
					...preparing,
					state: isNullish(progress) ? 'in_progress' : 'completed'
				},
				deposit: {
					...deposit,
					state:
						progress?.step === FactoryDeleteProgressStep.Deposit
							? mapProgressState(progress?.state)
							: deposit.state
				},
				stopping: {
					...stopping,
					state:
						progress?.step === FactoryDeleteProgressStep.StoppingCanister
							? mapProgressState(progress?.state)
							: stopping.state
				},
				deleting: {
					...deleting,
					state:
						progress?.step === FactoryDeleteProgressStep.DeletingCanister
							? mapProgressState(progress?.state)
							: deleting.state
				},
				detaching: {
					...detaching,
					state:
						progress?.step === FactoryDeleteProgressStep.Detaching
							? mapProgressState(progress?.state)
							: detaching.state
				},
				reload: {
					...reload,
					state:
						progress?.step === FactoryDeleteProgressStep.Reload
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
